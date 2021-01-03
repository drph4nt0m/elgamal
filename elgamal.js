/**
 * Fast modular exponentiation
 * @argument {number} base
 * @argument {number} exponent
 * @argument {number} modulo
 * @returns {number} value
 */
var fastModularExponentiation = function (base, exponent, modulo) {
  base = base % modulo
  var result = 1
  var x = base

  while (exponent > 0) {
    var leastSignificantBit = exponent % 2
    exponent = Math.floor(exponent / 2)

    if (leastSignificantBit === 1) {
      result = result * x
      result = result % modulo
    }

    x = x * x
    x = x % modulo
  }
  return result
}

/**
 * Verify Signature
 * @argument {number} alpha
 * @argument {number} beta
 * @argument {number} modulo
 * @argument {number} m
 * @argument {number} signature1
 * @argument {number} signature2
 * @returns {boolean} successful?
 */
function verify(alpha, beta, modulo, m, signature1, signature2) {
  let v1 = fastModularExponentiation(alpha, m, modulo)
  let v2 = fastModularExponentiation(
    fastModularExponentiation(beta, signature1, modulo) *
    fastModularExponentiation(signature1, signature2, modulo),
    1,
    modulo)

  return v1 === v2
}

/**
 * Discrete Logarithm
 * @argument {number} alpha
 * @argument {number} beta
 * @argument {number} modulo
 * @returns {number} secretKey
 */
function discreteLogarithm(alpha, beta, modulo) {
  let n = Math.floor(Math.sqrt(modulo) + 1)
  let value = new Array(n)

  for (let i = n; i >= 1; i--) {
    value[fastModularExponentiation(alpha, i * n, modulo)] = i
  }

  for (let i = 0; i < n; i++) {
    let curr = (fastModularExponentiation(alpha, i, modulo) * beta) % modulo
    if ((value[curr] > 0)) {
      let ans = value[curr] * n - i
      if (ans < modulo) {
        return ans
      }
    }
  }

  return -1
}

/**
 * Negative Modulo
 * @argument {number} negativeNumber
 * @argument {number} modulo
 * @returns {number} value
 */
function negativeModulo(negativeNumber, modulo) {
  let i = -1
  for (; i < modulo; i--) {
    if (modulo * i < negativeNumber) {
      break
    }
  }

  return -1 * (modulo * i) + negativeNumber
}

/**
 * Inverse Modulo
 * @argument {number} a
 * @argument {number} modulo
 * @returns {number} value
 */
function inverseModulo(a, modulo) {
  a = a % modulo
  for (let i = 0; i < modulo; i++) {
    if ((a * i) % modulo === 1) {
      return i
    }
  }

  return 1
}

/**
 * Greatest Common Divisor
 * @argument {number} number1
 * @argument {number} number2
 * @returns {number} value
 */
function gcd(number1, number2) {
  while (number1 != number2) {
    if (number1 > number2) {
      number1 = number1 - number2
    } else {
      number2 = number2 - number1
    }
  }

  return number1
}

/**
 * calculate k value
 * @argument {number} alpha
 * @argument {number} beta
 * @argument {number} modulo
 * @argument {number} m
 * @argument {number} signature1
 * @argument {number} signature2
 * @returns {number} value
 */
function calculateK(alpha, beta, modulo, m, signature1, signature2, secretKey) {
  let k = 0
  let aux =
    (m - secretKey * signature1) < 0 ?
    negativeModulo(m - secretKey * signature1, modulo - 1) :
    fastModularExponentiation(m - secretKey * signature1, 1, modulo - 1)

  let c = gcd(signature2, modulo - 1)
  if (c === 1) {
    let res = inverseModulo(signature2, modulo - 1) * (m - (secretKey * signature1))
    k = fastModularExponentiation(res, 1, modulo - 1)
  } else {
    let modulo2 = Math.floor((modulo - 1) / c)
    let signature2Inverse = inverseModulo(Math.floor(signature2 / c), modulo2)
    let kt = fastModularExponentiation(Math.floor(aux / c) * signature2Inverse, 1, modulo2)

    for (let i = 1; i <= c; i++) {
      k = kt + (i * modulo2)
      if (fastModularExponentiation(alpha, k, modulo) === signature1) {
        break
      }
    }
  }

  return k
}

/**
 * calculate k value
 * @argument {number} alpha
 * @argument {number} beta
 * @argument {number} p
 * @argument {number} m
 * @argument {number} signature1
 * @argument {number} signature2
 */
function run(alpha, beta, p, m, signature1, signature2) {
  const isSuccess = verify(alpha, beta, p, m, signature1, signature2)
  console.log(`The signature verification ${isSuccess ? 'passed': 'failed'}!`)
  const secretKey = discreteLogarithm(alpha, beta, p)
  console.log(`Secret Key is ${secretKey}.`)
  const k = calculateK(alpha, beta, p, m, signature1, signature2, secretKey)
  console.log(`The value of k is ${k}.`)

  return { isSuccess, secretKey, k }
}

const form = document.getElementById("form")
const result = document.getElementById("result")

form.onsubmit = async (e) => {
  e.preventDefault()
  result.classList.add('hide-me')

  const alpha = +document.getElementById("alpha").value
  const beta = +document.getElementById("beta").value
  const p = +document.getElementById("p").value
  const m = +document.getElementById("m").value
  const signature1 = +document.getElementById("signature1").value
  const signature2 = +document.getElementById("signature2").value

  const {isSuccess, secretKey, k} = run(alpha, beta, p, m, signature1, signature2)

  const isSuccessAnswer = document.getElementById("isSuccess-answer")
  const secretKeyAnswer = document.getElementById("secretKey-answer")
  const kAnswer = document.getElementById("k-answer")

  isSuccessAnswer.innerHTML = `The signature verification <strong>${isSuccess ? '<span class="green">passed</span>': '<span class="red">failed</span>'}</strong>!`
  secretKeyAnswer.innerHTML = `Secret Key is <strong class="green">${secretKey}</strong>.`
  kAnswer.innerHTML = `The value of k is <strong class="green">${k}</strong>.`

  result.classList.remove('hide-me')
}
