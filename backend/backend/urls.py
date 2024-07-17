from django.urls import path
from epres.views import send_pdf 

urlpatterns = [
    path('api/send-pdf', send_pdf, name='send_pdf'),  # Define the URL pattern and map it to the send_pdf view
]