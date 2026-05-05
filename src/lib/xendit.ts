import { Xendit, Invoice as InvoiceClient } from "xendit-node";

const xenditClient = new Xendit({
  secretKey: process.env.XENDIT_SECRET_KEY || "",
});

const { Invoice } = xenditClient;

export const createXenditInvoice = async (
  externalId: string,
  amount: number,
  customer: { email: string; name: string },
  description: string
) => {
  try {
    const data = {
      externalId,
      amount,
      description,
      currency: "IDR",
      customer: {
        givenNames: customer.name,
        email: customer.email,
      },
      successRedirectUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/services/${externalId}`,
      failureRedirectUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/services/${externalId}`,
    };

    const response = await Invoice.createInvoice({ data });
    return response;
  } catch (error) {
    console.error("Xendit Error:", error);
    throw error;
  }
};
