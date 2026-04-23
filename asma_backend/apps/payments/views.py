from django.shortcuts import render

# Create your views here.


# # Authenticated
# InitiatePaymentView

# # Public (M-Pesa callback)
# MpesaCallbackView

# # Admin
# PaymentListView
# PaymentDetailView


# Flow
# User creates order
# Calls InitiatePaymentView
# M-Pesa calls MpesaCallbackView
# You update order status