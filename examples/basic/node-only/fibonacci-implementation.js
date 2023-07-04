function doFibonacci(n) {
  if (n < 1) {
    return 0
  }
  if (n === 1) {
    return 1
  }
  return doFibonacci(n - 1) + doFibonacci(n - 2)
}

exports.doFibonacci = doFibonacci
