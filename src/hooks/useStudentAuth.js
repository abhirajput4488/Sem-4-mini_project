import { useSelector } from 'react-redux'
import { ACCOUNT_TYPE } from '../utils/constants'

export default function useStudentAuth() {
  const { user } = useSelector((state) => state.profile)
  
  if (!user || user.accountType !== ACCOUNT_TYPE.STUDENT) {
    return false
  }
  return true
} 