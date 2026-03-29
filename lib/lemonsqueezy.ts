// ── LemonSqueezy payment integration ──
// Replaces Stripe for LinkedKraft

export const LEMONSQUEEZY_API_URL = 'https://api.lemonsqueezy.com/v1'

export const LS_CONFIG = {
  apiKey: process.env.LEMONSQUEEZY_API_KEY!,
  storeId: process.env.LEMONSQUEEZY_STORE_ID!,
  webhookSecret: process.env.LEMONSQUEEZY_WEBHOOK_SECRET!,
}

export const PLANS = {
  starter_monthly: {
    variantId: process.env.LEMONSQUEEZY_STARTER_MONTHLY_VARIANT_ID!,
    name: 'Starter Monthly',
    price: 19,
    posts: 30,
  },
  starter_annual: {
    variantId: process.env.LEMONSQUEEZY_STARTER_ANNUAL_VARIANT_ID!,
    name: 'Starter Annual',
    price: 180,
    posts: 30,
  },
  pro_monthly: {
    variantId: process.env.LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID!,
    name: 'Pro Global Monthly',
    price: 49,
    posts: 999999,
  },
  pro_annual: {
    variantId: process.env.LEMONSQUEEZY_PRO_ANNUAL_VARIANT_ID!,
    name: 'Pro Global Annual',
    price: 468,
    posts: 999999,
  },
}

export const TOPUP_PACKS = [
  {
    credits: 10,
    price: 8,
    variantId: process.env.LEMONSQUEEZY_TOPUP_10_VARIANT_ID!,
    label: '10 Extra Posts',
    perPost: '$0.80/post',
  },
  {
    credits: 25,
    price: 20,
    variantId: process.env.LEMONSQUEEZY_TOPUP_25_VARIANT_ID!,
    label: '25 Extra Posts',
    perPost: '$0.80/post',
    popular: true,
  },
  {
    credits: 50,
    price: 40,
    variantId: process.env.LEMONSQUEEZY_TOPUP_50_VARIANT_ID!,
    label: '50 Extra Posts',
    perPost: '$0.80/post',
  },
]

// Create a checkout URL via LemonSqueezy API
export async function createCheckout({
  variantId,
  email,
  name,
  customData,
  redirectUrl,
}: {
  variantId: string
  email: string
  name?: string
  customData?: Record<string, string>
  redirectUrl: string
}) {
  const res = await fetch(`${LEMONSQUEEZY_API_URL}/checkouts`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${LS_CONFIG.apiKey}`,
      'Content-Type': 'application/vnd.api+json',
      Accept: 'application/vnd.api+json',
    },
    body: JSON.stringify({
      data: {
        type: 'checkouts',
        attributes: {
          checkout_data: {
            email,
            name: name || '',
            custom: customData || {},
          },
          checkout_options: {
            embed: false,
            media: false,
            logo: true,
          },
          product_options: {
            redirect_url: redirectUrl,
            receipt_link_url: redirectUrl,
          },
        },
        relationships: {
          store: {
            data: { type: 'stores', id: LS_CONFIG.storeId },
          },
          variant: {
            data: { type: 'variants', id: variantId },
          },
        },
      },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`LemonSqueezy checkout failed: ${err}`)
  }

  const data = await res.json()
  return data.data.attributes.url as string
}

// Verify webhook signature
export async function verifyWebhook(payload: string, signature: string): Promise<boolean> {
  const secret = LS_CONFIG.webhookSecret
  if (!secret) return true // skip in dev

  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  )

  const sigBytes = Buffer.from(signature, 'hex')
  const payloadBytes = encoder.encode(payload)

  return crypto.subtle.verify('HMAC', key, sigBytes, payloadBytes)
}
