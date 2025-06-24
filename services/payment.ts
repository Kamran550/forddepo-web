import { Paginate, Payment, PaymentResponse } from "interfaces";
import request from "./request";

const paymentService = {
  createTransaction: (id: number, data: any) =>
    request.post(`/payments/order/${id}/transactions`, data),
  getAll: (params?: any): Promise<Paginate<Payment>> =>
    request.get(`/rest/payments`, { params }),
  payExternal: (type: string, params: any) =>
    request.get(`/dashboard/user/order-${type}-process`, { params }),
  parcelTransaction: (id: number, data: any) =>
    request.post(`/payments/parcel-order/${id}/transactions`, data),
  getPaymentsForUser: (params?: any): Promise<Paginate<Payment>> =>
    request.get(`/rest/payments/user`, { params }),
  getPaymentsForUser2: (params?: any): Promise<PaymentResponse> =>
    request.get(`/rest/payments/user2`, { params }),
};

export default paymentService;
