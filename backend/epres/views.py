# views.py (Django backend)
#from django.http import JsonResponse
#from twilio.rest import Client
#from django.views.decorators.csrf import csrf_exempt


#@csrf_exempt
'''def send_pdf(request):
    if request.method == 'POST':
        data = request.POST
        print(data)
        pdf_url = data.get('pdfURL')
        patient_number = data.get('patientNumber')
        print(pdf_url)
        print(patient_number)

        if pdf_url and patient_number:
            # Initialize Twilio client with your Twilio credentials
            account_sid = 'YOUR_TWILIO_ACCOUNT_SID'
            auth_token = 'YOUR_TWILIO_AUTH_TOKEN'
            client = Client(account_sid, auth_token)

            try:
                # Send an SMS message containing the PDF URL to the patient's number
                message = client.messages.create(
                    body=f'Your prescription PDF is ready. You can download it from the following link: {pdf_url}',
                    from_='YOUR_TWILIO_PHONE_NUMBER',
                    to=patient_number
                )
                return JsonResponse({'success': True, 'message': 'SMS sent successfully'})
            except Exception as e:
                return JsonResponse({'success': False, 'error': str(e)})
        else:
            return JsonResponse({'success': False, 'error': 'Missing PDF URL or patient number'})
        return JsonResponse({'message': 'PDF URL received successfully'}, status=200)
    else:
        return JsonResponse({'success': False, 'error': 'Invalid request method'})'''
        
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from twilio.rest import Client

@csrf_exempt
def send_pdf(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        pdf_url = data.get('pdfURL')
        patient_number = data.get('patientNumber')
        print(pdf_url)
        print(patient_number)
        
        account_sid = ''
        auth_token = ''
        client = Client(account_sid, auth_token)

        try:
            # Send an SMS message containing the PDF URL to the patient's number
            message = client.messages.create(
                body=f'{pdf_url}',
                from_='',
                to=patient_number
            )
            return JsonResponse({'success': True, 'message': 'SMS sent successfully'})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
    else:
        return JsonResponse({'success': False, 'error': 'Invalid request method'})