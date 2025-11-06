import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebaseConfig';
import { apiLogger } from '../utils/apiLogger';

class OTPApiService {
  /**
   * Generate OTP for user registration
   */
  async generateOTP(email: string, userData: any): Promise<{ success: boolean; message: string; otpId?: string }> {
    const requestData = { email, userData };
    try {
      const generateOTPFunction = httpsCallable(functions, 'generateOTP');
      const result = await generateOTPFunction(requestData);
      apiLogger.logFirebaseCallable('generateOTP', requestData, result.data);
      return result.data as { success: boolean; message: string; otpId?: string };
    } catch (error: any) {
      apiLogger.logFirebaseCallable('generateOTP', requestData, undefined, error);
      console.error('Error generating OTP:', error);
      throw new Error(error.message || 'Failed to generate OTP');
    }
  }

  /**
   * Verify OTP entered by user
   */
  async verifyOTP(email: string, otp: string): Promise<{ success: boolean; message: string; userData?: any }> {
    const requestData = { email, otp };
    try {
      const verifyOTPFunction = httpsCallable(functions, 'verifyOTP');
      const result = await verifyOTPFunction(requestData);
      apiLogger.logFirebaseCallable('verifyOTP', requestData, result.data);
      return result.data as { success: boolean; message: string; userData?: any };
    } catch (error: any) {
      apiLogger.logFirebaseCallable('verifyOTP', requestData, undefined, error);
      console.error('Error verifying OTP:', error);
      throw new Error(error.message || 'Failed to verify OTP');
    }
  }

  /**
   * Resend OTP to user
   */
  async resendOTP(email: string, userData: any): Promise<{ success: boolean; message: string; otpId?: string }> {
    const requestData = { email, userData };
    try {
      const resendOTPFunction = httpsCallable(functions, 'resendOTP');
      const result = await resendOTPFunction(requestData);
      apiLogger.logFirebaseCallable('resendOTP', requestData, result.data);
      return result.data as { success: boolean; message: string; otpId?: string };
    } catch (error: any) {
      apiLogger.logFirebaseCallable('resendOTP', requestData, undefined, error);
      console.error('Error resending OTP:', error);
      throw new Error(error.message || 'Failed to resend OTP');
    }
  }
}

export const otpApiService = new OTPApiService();
