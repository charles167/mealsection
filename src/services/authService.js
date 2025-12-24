export const loginUser = async (email, password) => {
    return { token: "dummy_token", user: { email } };
  };
  
  export const signupUser = async (name, email, password) => {
    return { token: "dummy_token", user: { name, email } };
  };
  