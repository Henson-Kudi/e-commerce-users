// Exports a regular expression for a string that should have atleast one uppercase letter, one lowercase letter, one number, one special character and must be 8 digits long

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export default passwordRegex;
