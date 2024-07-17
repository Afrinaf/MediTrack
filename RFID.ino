#include <MFRC522.h>
#include <SPI.h>
#include <WiFi.h>
#include <WebSocketsServer.h>

#define SS_PIN 5
#define RST_PIN 0

const char* ssid = "Galaxy A53 5G";
const char* password = "elitepro";
const int webSocketPort = 81;

MFRC522 mfrc522(SS_PIN, RST_PIN);
WebSocketsServer webSocket = WebSocketsServer(webSocketPort);

void setup() {
  Serial.begin(230400);
  SPI.begin();
  mfrc522.PCD_Init();
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("Connected to WiFi");
  webSocket.begin();
}

void loop() {
  if (mfrc522.PICC_IsNewCardPresent() && mfrc522.PICC_ReadCardSerial()) {
    String tagNumber = "";
    for (byte i = 0; i < mfrc522.uid.size; i++) {
      tagNumber += String(mfrc522.uid.uidByte[i], HEX);
    }
    mfrc522.PICC_HaltA();
    Serial.println(tagNumber);
    webSocket.broadcastTXT("RFID:" + tagNumber);
    delay(2000);
  }
  webSocket.loop();
}
