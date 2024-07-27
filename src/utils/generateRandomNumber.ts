// This function should generate a string of random numbers with given length
export default function generateRandomNumber(length: number = 6): string {
  return Math.floor(Math.random() * Math.pow(10, length)).toString();
}
