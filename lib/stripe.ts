import Stripe from 'stripe'
import { loadStripe } from '@stripe/stripe-js'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-04-10', typescript: true })

let sp: ReturnType<typeof loadStripe>
export const getStripe = () => { if (!sp) sp = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!); return sp }

export const PLAN_LIMITS: Record<string, number> = { free: 5, starter: 30, pro: 999999 }

export const TOPUP_PACKS = [
  { credits: 10, price: 5,  priceId: process.env.STRIPE_TOPUP_10_PRICE_ID!, label: '10 Extra Posts', perPost: '$0.50' },
  { credits: 25, price: 10, priceId: process.env.STRIPE_TOPUP_25_PRICE_ID!, label: '25 Extra Posts', perPost: '$0.40', popular: true },
  { credits: 50, price: 18, priceId: process.env.STRIPE_TOPUP_50_PRICE_ID!, label: '50 Extra Posts', perPost: '$0.36' },
]
