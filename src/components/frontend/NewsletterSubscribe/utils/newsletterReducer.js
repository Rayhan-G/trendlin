// src/components/frontend/NewsletterSubscribe/utils/newsletterReducer.js

export const initialState = {
  user: null,
  authChecked: false,
  selectedCategories: [],
  originalCategories: [],
  loading: false,
  error: '',
  cooldown: false,
  showSuccessModal: false,
  subscriptionStatus: null,
  showAuthPopup: false,
  currentPageCategory: null,
  isEditing: false,
  
  // Email states
  accountEmail: '',
  newsletterEmail: '',
  originalNewsletterEmail: '',
  newEmailInput: '',
  emailLoading: false,
  emailError: '',
  
  // Verification states
  showVerificationModal: false,
  verificationCode: '',
  verificationId: '',
  pendingNewEmail: '',
  sendingCode: false,
  
  // Confirm modal
  showConfirmModal: false,
  pendingSubscription: null
}

export function newsletterReducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload }
    
    case 'SET_AUTH_CHECKED':
      return { ...state, authChecked: action.payload }
    
    case 'SET_SUBSCRIPTION_STATUS':
      return { ...state, subscriptionStatus: action.payload }
    
    case 'SET_SELECTED_CATEGORIES':
      return { ...state, selectedCategories: action.payload }
    
    case 'SET_ORIGINAL_CATEGORIES':
      return { ...state, originalCategories: action.payload }
    
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    
    case 'SET_COOLDOWN':
      return { ...state, cooldown: action.payload }
    
    case 'SET_SHOW_SUCCESS_MODAL':
      return { ...state, showSuccessModal: action.payload }
    
    case 'SET_SHOW_AUTH_POPUP':
      return { ...state, showAuthPopup: action.payload }
    
    case 'SET_CURRENT_PAGE_CATEGORY':
      return { ...state, currentPageCategory: action.payload }
    
    case 'SET_IS_EDITING':
      return { ...state, isEditing: action.payload }
    
    case 'SET_ACCOUNT_EMAIL':
      return { ...state, accountEmail: action.payload }
    
    case 'SET_NEWSLETTER_EMAIL':
      return { ...state, newsletterEmail: action.payload, originalNewsletterEmail: action.payload }
    
    case 'SET_NEW_EMAIL_INPUT':
      return { ...state, newEmailInput: action.payload }
    
    case 'SET_EMAIL_LOADING':
      return { ...state, emailLoading: action.payload }
    
    case 'SET_EMAIL_ERROR':
      return { ...state, emailError: action.payload }
    
    case 'SET_SHOW_VERIFICATION_MODAL':
      return { ...state, showVerificationModal: action.payload }
    
    case 'SET_VERIFICATION_CODE':
      return { ...state, verificationCode: action.payload }
    
    case 'SET_VERIFICATION_ID':
      return { ...state, verificationId: action.payload }
    
    case 'SET_PENDING_NEW_EMAIL':
      return { ...state, pendingNewEmail: action.payload }
    
    case 'SET_SENDING_CODE':
      return { ...state, sendingCode: action.payload }
    
    case 'SET_SHOW_CONFIRM_MODAL':
      return { ...state, showConfirmModal: action.payload }
    
    case 'SET_PENDING_SUBSCRIPTION':
      return { ...state, pendingSubscription: action.payload }
    
    case 'RESET_EMAIL_STATE':
      return {
        ...state,
        showVerificationModal: false,
        verificationCode: '',
        verificationId: '',
        pendingNewEmail: '',
        emailError: '',
        emailLoading: false,
        sendingCode: false
      }
    
    case 'TOGGLE_CATEGORY': {
      const { selectedCategories } = state
      if (selectedCategories.includes(action.payload)) {
        return { ...state, selectedCategories: selectedCategories.filter(c => c !== action.payload) }
      } else {
        return { ...state, selectedCategories: [...selectedCategories, action.payload] }
      }
    }
    
    default:
      return state
  }
}