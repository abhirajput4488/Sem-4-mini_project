import { toast } from "react-hot-toast"

import { setLoading, setToken } from "../../slices/authSlice"
import { resetCart } from "../../slices/cartSlice"
import { setUser } from "../../slices/profileSlice"
import { apiConnector } from "../apiconnector"
import { endpoints } from "../apis"

const {
  SENDOTP_API,
  SIGNUP_API,
  LOGIN_API,
  RESETPASSTOKEN_API,
  RESETPASSWORD_API,
} = endpoints

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Validate email format
const validateEmail = (email) => {
  return emailRegex.test(email);
}

export function sendOtp(email, navigate) {
  return async (dispatch) => {
    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    const toastId = toast.loading("Loading...")
    dispatch(setLoading(true))
    try {
      const response = await apiConnector("POST", SENDOTP_API, {
        email,
        checkUserPresent: true,
      })
      console.log("SENDOTP API RESPONSE............", response)

      console.log(response.data.success)

      if (!response.data.success) {
        throw new Error(response.data.message)
      }

      toast.success("OTP Sent Successfully")
      navigate("/verify-email")
    } catch (error) {
      console.log("SENDOTP API ERROR............", error)
      toast.error(error.message || "Could Not Send OTP")
    }
    dispatch(setLoading(false))
    toast.dismiss(toastId)
  }
}

export function signUp(
  accountType,
  firstName,
  lastName,
  email,
  password,
  confirmPassword,
  otp,
  navigate
) {
  return async (dispatch) => {
    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    const toastId = toast.loading("Loading...")
    dispatch(setLoading(true))
    try {
      const response = await apiConnector("POST", SIGNUP_API, {
        accountType,
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
        otp,
      })

      console.log("SIGNUP API RESPONSE............", response)

      if (!response.data.success) {
        throw new Error(response.data.message)
      }
      toast.success("Signup Successful")
      navigate("/login")
    } catch (error) {
      console.log("SIGNUP API ERROR............", error)
      toast.error(error.message || "Signup Failed")
    }
    dispatch(setLoading(false))
    toast.dismiss(toastId)
  }
}

export function login(email, password, navigate) {
  return async (dispatch) => {
    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    const toastId = toast.loading("Loading...")
    dispatch(setLoading(true))
    try {
      const response = await apiConnector("POST", LOGIN_API, {
        email,
        password,
      })

      console.log("LOGIN API RESPONSE............", response)

      // First check if we have a response
      if (!response?.data) {
        throw new Error("Could not connect to server")
      }

      // Check for unsuccessful login attempts
      if (!response.data.success) {
        const errorMessage = response.data.message;
        // Check specific error messages from backend
        if (errorMessage.includes("not Registered")) {
          throw new Error("User not registered. Please signup first.")
        } else if (errorMessage.includes("Password is incorrect")) {
          throw new Error("Invalid password. Please try again.")
        } else {
          throw new Error(errorMessage || "Login failed")
        }
      }

      // Verify user data and token exist
      const userData = response.data.user
      const token = response.data.token
      if (!userData || !token) {
        throw new Error("Login failed - invalid password or email not registered")
      }

      // Login successful
      toast.success("Login Successful")
      
      // Set user data and token
      dispatch(setToken(token))
      
      // Safely create image URL
      const userImage = userData.image || 
        (userData.firstName && userData.lastName 
          ? `https://api.dicebear.com/5.x/initials/svg?seed=${userData.firstName} ${userData.lastName}`
          : `https://api.dicebear.com/5.x/initials/svg?seed=User`)
      
      dispatch(setUser({ ...userData, image: userImage }))
      
      // Save to localStorage
      localStorage.setItem("token", JSON.stringify(token))
      localStorage.setItem("user", JSON.stringify(userData))
      
      // Navigate to dashboard
      navigate("/dashboard/my-profile")
    } catch (error) {
      console.log("LOGIN API ERROR............", error)
      // Clear any existing auth data
      dispatch(setToken(null))
      dispatch(setUser(null))
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      
      // Show specific error message
      toast.error(error.message)
    } finally {
      dispatch(setLoading(false))
      toast.dismiss(toastId)
    }
  }
}

export function logout(navigate) {
  return (dispatch) => {
    dispatch(setToken(null))
    dispatch(setUser(null))
    dispatch(resetCart())
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    toast.success("Logged Out")
    navigate("/")
  }
}

export function getPasswordResetToken(email, setEmailSent) {
  return async(dispatch) => {
    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    dispatch(setLoading(true));
    try {
      const response = await apiConnector("POST", RESETPASSTOKEN_API, {email});

      console.log("RESET PASSWORD TOKEN RESPONSE....", response);

      if (!response?.data) {
        throw new Error("Could not connect to server")
      }

      if(!response.data.success) {
        const errorMessage = response.data.message;
        if (errorMessage.includes("not Registered")) {
          throw new Error("Email not registered. Please signup first.")
        } else {
          throw new Error(errorMessage || "Failed to send reset email")
        }
      }

      toast.success("Reset email sent successfully");
      setEmailSent(true);
    }
    catch(error) {
      console.log("RESET PASSWORD TOKEN Error", error);
      toast.error(error.message || "Failed to send reset email");
      setEmailSent(false);
    }
    finally {
      dispatch(setLoading(false));
    }
  }
}

export function resetPassword(password, confirmPassword, token) {
  return async(dispatch) => {
    dispatch(setLoading(true));
    try {
      if (!password || !confirmPassword) {
        throw new Error("Please fill in both password fields")
      }

      if (password !== confirmPassword) {
        throw new Error("Passwords do not match")
      }

      const response = await apiConnector("POST", RESETPASSWORD_API, {
        password, 
        confirmPassword, 
        token
      });

      console.log("RESET Password RESPONSE ... ", response);

      if (!response?.data) {
        throw new Error("Could not connect to server")
      }

      if(!response.data.success) {
        throw new Error(response.data.message || "Failed to reset password")
      }

      toast.success("Password has been reset successfully");
    }
    catch(error) {
      console.log("RESET PASSWORD Error", error);
      toast.error(error.message || "Failed to reset password");
    }
    finally {
      dispatch(setLoading(false));
    }
  }
}