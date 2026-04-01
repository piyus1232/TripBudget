/** USD → INR for hotel price conversion (Agoda-style USD prices). Override via USD_TO_INR_RATE in .env */
export const USD_TO_INR =
  Number(process.env.USD_TO_INR_RATE) > 0
    ? Number(process.env.USD_TO_INR_RATE)
    : 87.58;
