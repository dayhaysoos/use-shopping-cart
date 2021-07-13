//     Current API
//     mode,
//     cartMode,
//     stripePublicKey,
//     successUrl,
//     cancelUrl,
//     currency,
//     allowedCountries,
//     billingAddressCollection

exports.pluginOptionsSchema = ({ Joi }) => {
  return Joi.object({
    mode: Joi.string()
      .default(`payment`)
      .description(`Mode should be "payment"`),
    cartMode: Joi.string()
      .default(`client-only`)
      .description(`Cart mode can be 'client-only' or 'checkout-session'.`),
    stripePublicKey: Joi.string()
      .required()
      .description(`Public key from your Stripe dashboard.`)
      .messages({
        // Override the error message if the .required() call fails
        "any.required": `"Stripe Public Key" needs to be provided. Get the correct value from your Stripe dashboard`,
      }),
    successUrl: Joi.string()
      .default(`https://useshoppingcart.com/`)
      .description(`Url redirect on a successful purchase.`),
    cancelUrl: Joi.string()
      .default(`https://stripe.com/`)
      .description(`Url redirect on a cancelled purchase.`),
    // allowedCountries: ["US", "GB", "CA"],
    allowedCountries: Joi.array()
      .items(Joi.string())
      .default(["US", "GB", "CA"])
      .description(
        `Array of allowed countries for Stripe purchases, use international two letter country codes. `
      ),
    currency: Joi.string()
      .default(`USD`)
      .description(`Currency for transaction, see Stripe docs for details.`),
    billingAddressCollection: Joi.boolean()
      .default(true)
      .description(`Boolean to enable billing address collection.`),
  })
}
