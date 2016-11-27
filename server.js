var express = require('express')
var bodyParser = require('body-parser')
var request = require('request')
var app = express()
var test = require('./Data.json')
for(var i = 0; i < test.employees.length; i++) {
    var obj = test.employees[i];

    console.log(obj.firstName);
}

app.use(bodyParser.json())
app.set('port', (process.env.PORT || 4000))
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.get('/webhook', function(req, res) {
  var key = 'EAANZAja8Q2n0BAMB7hyWYwKkL84couhF6WrHeWI2LaDl9WIZB0NFhgZCZAC2eWQYOgusV3LsVt27cNYwgZATE7I08g8dWYnBuf5mk4CgETQFlCBubaeOiVYUq8SgUZA5fz91bSgKWc93WDWGu1dTZBe2MDk4xZBKKJtZCkS6BLZBs4lQZDZD'
  if (req.query['hub.mode'] === 'subscribe' &&
    req.query['hub.verify_token'] === key) {
    console.log("Validating webhook");
    res.send(req.query['hub.challenge'])
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);          
  }  
});

app.post('/webhook', function (req, res) {
  var data = req.body;

  // Make sure this is a page subscription
  if (data.object == 'page') {
    // Iterate over each entry
    // There may be multiple if batched
    data.entry.forEach(function(pageEntry) {
      var pageID = pageEntry.id;
      var timeOfEvent = pageEntry.time;

      // Iterate over each messaging event
      pageEntry.messaging.forEach(function(messagingEvent) {
        if (messagingEvent.message) {
          receivedMessage(messagingEvent);
        } else if (messagingEvent.postback) {
          receivedPostback(messagingEvent);
        } else {
          console.log("Webhook received unknown messagingEvent: ", messagingEvent);
        }
      });
    });

    // Assume all went well.
    //
    // You must send back a 200, within 20 seconds, to let us know you've 
    // successfully received the callback. Otherwise, the request will time out.
    res.sendStatus(200);
  }
});

function receivedMessage(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  console.log("Received message for user %d and page %d at %d with message:", 
    senderID, recipientID, timeOfMessage);
  console.log(JSON.stringify(message));

  var isEcho = message.is_echo;
  var messageId = message.mid;
  var appId = message.app_id;
  var metadata = message.metadata;
 
  // You may get a text or attachment but not both
  var messageText = message.text;
  var messageAttachments = message.attachments;
  var quickReply = message.quick_reply;

 /* if (isEcho) {
    // Just logging message echoes to console
    console.log("Received echo for message %s and app %d with metadata %s", 
      messageId, appId, metadata);
    return;
  } else if (quickReply) {
    var quickReplyPayload = quickReply.payload;
    console.log("Quick reply for message %s with payload %s",
      messageId, quickReplyPayload);
    sendTextMessage(senderID, "Quick reply tapped");
    return;
  }*/
  if (messageText) {
    if (messageText == 'ค้นหาร้านอาหาร') {
      setTimeout(function() {
        sendTextMessage(senderID, "นี้คือร้านอาหารยอดนิยมในปราจีนบุรี");
      }, 500)
      setTimeout(function() {
        sendTextMessage(senderID, "คุณต้องการรับประทานอาหารในสถานที่ใดครับ 🏠");
      }, 1000)
      setTimeout(function() {
        findRestaurants(senderID);
      }, 1500)
    }
    else if (messageText == 'ไม่เป็นไร ขอบคุณ') {
      setTimeout(function() {
        sendTextMessage(senderID, ":(");
      }, 500)
      setTimeout(function() {
        sendTextMessage(senderID, "แน่ใจนะครับ! คุณจะไม่หิวตอนนี้ใช่มั้ย");
      }, 1000)
      setTimeout(function() {
        needYourHelp(senderID);
      }, 1500) 
    }
    else if (messageText == 'ต้องการให้คุณช่วย') {
      setTimeout(function() {
        sendTextMessage(senderID, "นี้คือร้านอาหารยอดนิยมในปราจีนบุรี");
      }, 500)
      setTimeout(function() {
        sendTextMessage(senderID, "คุณต้องการรับประทานอาหารในสถานที่ใดครับ 🏠");
      }, 1000)
      setTimeout(function() {
        findRestaurants(senderID);
      }, 1500)
    } else {}

    // If we receive a text message, check to see if it matches a keyword
    // and send back the example. Otherwise, just echo the text we received.
    switch (messageText) {
      case 'hello':
        sendGreetMessage(senderID);
        break;
      case 'ไม่':
        setTimeout(function() {
          sendTextMessage(senderID, ":(");
        }, 500)
        setTimeout(function() {
          sendTextMessage(senderID, "แน่ใจนะครับ! คุณจะไม่หิวตอนนี้ใช่มั้ย");
        }, 1000)
        setTimeout(function() {
          needYourHelp(senderID);
        }, 1500)
        break;
      default:
        needYourHelpDefault(senderID);
    }
  } 
  else if (messageAttachments) {
    sendTextMessage(senderID, "Message with attachment received"); /////ปุ่มกดไลน์ ค่อยทำต่อ
  }
}

function receivedPostback(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfPostback = event.timestamp;

  // The 'payload' param is a developer-defined field which is set in a postback 
  // button for Structured Messages. 
  var payload = event.postback.payload;
  
  console.log("Received postback for user %d and page %d with payload '%s' " + 
    "at %d", senderID, recipientID, payload, timeOfPostback);
  
  if(payload == 'getStart'){
       sendTextMessage(senderID, "สวัสดีครับ :)");
       sendGreetMessage(senderID);
  }
  ///////////////////////////////////////////////////////////////////
  else if(payload == 'findRestaurant'||payload == 'I_need_your_help'|| payload == 'changeRestaurant'){
    setTimeout(function() {
      sendTextMessage(senderID, "นี้คือร้านอาหารยอดนิยมในปราจีนบุรี");
    }, 500)
    setTimeout(function() {
      sendTextMessage(senderID, "คุณต้องการรับประทานอาหารในสถานที่ใดครับ 🏠");
    }, 1000)
    setTimeout(function() {
      findRestaurants(senderID);
    }, 1500)
  }
  else if(payload == 'noThank'){
    setTimeout(function() {
      sendTextMessage(senderID, ":(");
    }, 500)
    setTimeout(function() {
      sendTextMessage(senderID, "แน่ใจนะครับ! คุณจะไม่หิวตอนนี้ใช่มั้ย");
    }, 1000)
    setTimeout(function() {
      needYourHelp(senderID);
    }, 1500)
  } 
  //////////////////////////////////////////////////////////////////
  else if(payload == 'robinson'||payload == 'baannernnam'||payload == 'ChomChol'||payload == 'Add'||payload == 'PalmSweetHome'||payload == 'NamHiang'||payload == 'CafeKantary'){
    setTimeout(function() {
   if(payload == 'robinson'){sendTextMessage(senderID, "แน่นอนครับ! คุณจะพบร้านอาหารที่โรบินสัน ปราจีนบุรี");}
      if(payload == 'baannernnam'){sendTextMessage(senderID, "แน่นอนครับ! คุณจะพบร้านอาหารที่มีหลากหลายเมนูที่สวนอาหาร บ้านเนินน้ำ");}
      if(payload == 'ChomChol'){sendTextMessage(senderID, "แน่นอนครับ! คุณจะพบร้านอาหารที่มีหลากหลายเมนูที่ร้านอาหารชมชล");}
      if(payload == 'Add'){sendTextMessage(senderID, "แน่นอนครับ! คุณจะพบร้านอาหารที่มีหลากหลายเมนูที่ร้านแอ๊ด ข้าวต้ม กบินทร์บุรี");}
      if(payload == 'PalmSweetHome'){sendTextMessage(senderID, "แน่นอนครับ! คุณจะพบร้านอาหารที่มีหลากหลายเมนูที่ร้านอาหาร ปาล์มสวีทโฮม กบินทร์บุรี ปราจีนบุรี");}
      if(payload == 'NamHiang'){sendTextMessage(senderID, "แน่นอนครับ! คุณจะพบร้านอาหารที่มีหลากหลายเมนูที่ร้านน่ำเฮียง โภชนา (ฟ้ามุ่ย) ร้านอร่อยที่กบินทร์บุรี");}
      if(payload == 'CafeKantary'){sendTextMessage(senderID, "แน่นอนครับ! คุณจะพบกับเบเกอรี่แสนอร่อยที่ร้าน Cafe Kantary ");}
    }, 500)
    setTimeout(function() {
      sendTextMessage(senderID, "คุณชอบรับประทานอาหารประเภทไหนครับ");
    }, 1000)
    setTimeout(function() {
       if(payload == 'robinson'){menuFoodRobinson(senderID);}
      else if(payload == 'baannernnam'){menuFoodBaannernnam(senderID);}
      else if(payload == 'ChomChol'){menuFoodChomChol(senderID);}
      else if(payload == 'Add'){menuFoodAdd(senderID);}
      else if(payload == 'PalmSweetHome'){menuFoodPalmSweetHome(senderID);}
      else if(payload == 'NamHiang'){menuFoodNamHiang(senderID);}
      else if(payload == 'CafeKantary'){menuFoodCafeKantary(senderID);}
      else{var result = "";}
    }, 1500)
  }
  ///////////////////// ต้องการทานสิ่งนี้ Cafe//////////////////////////////////////
  else if(payload == 'eatCafeFirst'||payload == 'eatCafeSecond'||payload == 'eatCafeThird'||payload == 'eatCafeFourth'||payload == 'eatCafeFifth'||payload == 'eatCafeSixth'){
    setTimeout(function() {
      if(payload == 'eatCafeFirst'){sendTextMessage(senderID, "โอเคครับ! คุณต้องการรับประทานฮันนี่โทสต์ที่ร้าน Cafe Kantary ใช่มั้ยครับ");}
      if(payload == 'eatCafeSecond'){sendTextMessage(senderID, "โอเคครับ! คุณต้องการรับประทานเบอร์รี่เบอร์รี่เครปที่ร้าน Cafe Kantary ใช่มั้ยครับ");}
      if(payload == 'eatCafeThird'){sendTextMessage(senderID, "โอเคครับ! คุณต้องการรับประทานคาราเมลวาฟเฟิลที่ร้าน Cafe Kantary ใช่มั้ยครับ");}
      if(payload == 'eatCafeFourth'){sendTextMessage(senderID, "โอเคครับ! คุณต้องการรับประทานสตอเบอร์รี่วาฟเฟิลที่ร้าน Cafe Kantary ใช่มั้ยครับ");}
      if(payload == 'eatCafeFifth'){sendTextMessage(senderID, "โอเคครับ! คุณต้องการรับประทานโอ้ล้าลาฮันนี่โทสต์ที่ร้าน Cafe Kantary ใช่มั้ยครับ");}
      if(payload == 'eatCafeSixth'){sendTextMessage(senderID, "โอเคครับ! คุณต้องการรับประทานไอศครีมโฮมเมดที่ร้าน Cafe Kantary ใช่มั้ยครับ");}
    }, 500)
    setTimeout(function() {
      if(payload == 'eatCafeFirst'){sendTextMessage(senderID, "ฮันนี่โทสต์คนส่วนใหญ่ชอบรับประทานกันมากครับ :)");}
      if(payload == 'eatCafeSecond'){sendTextMessage(senderID, "เบอร์รี่เบอร์รี่เครปคนส่วนใหญ่ชอบรับประทานกันมากครับ :)");}
      if(payload == 'eatCafeThird'){sendTextMessage(senderID, "คาราเมลวาฟเฟิลคนส่วนใหญ่ชอบรับประทานกันมากครับ :)");}
      if(payload == 'eatCafeFourth'){sendTextMessage(senderID, "สตอเบอร์รี่วาฟเฟิลคนส่วนใหญ่ชอบรับประทานกันมากครับ :)");}
      if(payload == 'eatCafeFifth'){sendTextMessage(senderID, "โอ้ล้าลาฮันนี่โทสต์คนส่วนใหญ่ชอบรับประทานกันมากครับ :)");}
      if(payload == 'eatCafeSixth'){sendTextMessage(senderID, "ไอศครีมโฮมเมดคนส่วนใหญ่ชอบรับประทานกันมากครับ :)");}
    }, 1000)
    setTimeout(function() {
      if(payload == 'eatCafeFirst'){sendImageCafeFirst(senderID);}
      if(payload == 'eatCafeSecond'){sendImageCafeSecond(senderID);}
      if(payload == 'eatCafeThird'){sendImageCafeThird(senderID);}
      if(payload == 'eatCafeFourth'){sendImageCafeFourth(senderID);}
      if(payload == 'eatCafeFifth'){sendImageCafeFifth(senderID);}
      if(payload == 'eatCafeSixth'){sendImageCafeSixth(senderID);}
    }, 1500)
    setTimeout(function() {
      if(payload == 'eatCafeFirst'){sendTextMessage(senderID, "ราคา : 80 บาท");} 
      if(payload == 'eatCafeSecond'){sendTextMessage(senderID, "ราคา : 69 บาท");}
      if(payload == 'eatCafeThird'){sendTextMessage(senderID, "ราคา : 69 บาท");}
      if(payload == 'eatCafeFourth'){sendTextMessage(senderID, "ราคา : 69 บาท");}
      if(payload == 'eatCafeFifth'){sendTextMessage(senderID, "ราคา : 80 บาท");}
      if(payload == 'eatCafeSixth'){sendTextMessage(senderID, "ราคา : 99 บาท");}
    }, 2000)
    setTimeout(function() {
      if(payload == 'eatCafeFirst'){sendTextMessage(senderID, "เวลาเปิด-ปิด : 09.00 - 23.00 น.");} 
      if(payload == 'eatCafeSecond'){sendTextMessage(senderID, "เวลาเปิด-ปิด : 09.00 - 23.00 น.");}
      if(payload == 'eatCafeThird'){sendTextMessage(senderID, "เวลาเปิด-ปิด : 09.00 - 23.00 น.");}
      if(payload == 'eatCafeFourth'){sendTextMessage(senderID, "เวลาเปิด-ปิด : 09.00 - 23.00 น.");}
      if(payload == 'eatCafeFifth'){sendTextMessage(senderID, "เวลาเปิด-ปิด : 09.00 - 23.00 น.");}
      if(payload == 'eatCafeSixth'){sendTextMessage(senderID, "เวลาเปิด-ปิด : 09.00 - 23.00 น.");}
    }, 2500)
    setTimeout(function() {
      if(payload == 'eatCafeFirst'){sendTextMessage(senderID, "วันหยุด : วันอังคารเวลา 10 โมง");} 
      if(payload == 'eatCafeSecond'){sendTextMessage(senderID, "วันหยุด : วันอังคารเวลา 10 โมง");}
      if(payload == 'eatCafeThird'){sendTextMessage(senderID, "วันหยุด : วันอังคารเวลา 10 โมง");}
      if(payload == 'eatCafeFourth'){sendTextMessage(senderID, "วันหยุด : วันอังคารเวลา 10 โมง");}
      if(payload == 'eatCafeFifth'){sendTextMessage(senderID, "วันหยุด : วันอังคารเวลา 10 โมง");}
      if(payload == 'eatCafeSixth'){sendTextMessage(senderID, "วันหยุด : วันอังคารเวลา 10 โมง");}
    }, 3000)
  }
  /////////////////////////////ต้องการกินสิ่งนี้ Robinson/////////////////////
  else if(payload == 'eatSalang'||payload == 'eatJefferSteak'||payload == 'eatYayoi'||payload == 'eatHotPot'||payload == 'eatTempura'||payload == 'eatRamenChampion'){
    setTimeout(function() {
      if(payload == 'eatSalang'){sendTextMessage(senderID, "โอเคครับ! คุณต้องการรับประทาน Topokki โรบินสันใช่มั้ยครับ");}
      if(payload == 'eatJefferSteak'){sendTextMessage(senderID, "โอเคครับ! คุณต้องการรับประทาน Wagyu Steak ที่โรบินสันใช่มั้ยครับ");}
      if(payload == 'eatYayoi'){sendTextMessage(senderID, "โอเคครับ! คุณต้องการรับประทาน Takoyaki ที่โรบินสันใช่มั้ยครับ");}
      if(payload == 'eatHotPot'){sendTextMessage(senderID, "โอเคครับ! คุณต้องการรับประทาน Hot Pot ที่โรบินสันใช่มั้ยครับ");}
      if(payload == 'eatTempura'){sendTextMessage(senderID, "โอเคครับ! คุณต้องการรับประทาน Tempura Somen ที่โรบินสันใช่มั้ยครับ");}
      if(payload == 'eatRamenChampion'){sendTextMessage(senderID, "โอเคครับ! คุณต้องการรับประทาน Ramen Champion ที่โรบินสันใช่มั้ยครับ");}
    }, 500)
    setTimeout(function() {
      if(payload == 'eatSalang'){sendTextMessage(senderID, "Topokki คนส่วนใหญ่ชอบรับประทานกันมากครับ :)");}
      if(payload == 'eatJefferSteak'){sendTextMessage(senderID, "Wagyu Steak คนส่วนใหญ่ชอบรับประทานกันมากครับ :)");}
      if(payload == 'eatYayoi'){sendTextMessage(senderID, "Takoyaki คนส่วนใหญ่ชอบรับประทานกันมากครับ :)");}
      if(payload == 'eatHotPot'){sendTextMessage(senderID, "Hot Pot คนส่วนใหญ่ชอบรับประทานกันมากครับ :)");}
      if(payload == 'eaTempura'){sendTextMessage(senderID, "Tempura Somen คนส่วนใหญ่ชอบรับประทานกันมากครับ :)");}
      if(payload == 'eatRamenChampion'){sendTextMessage(senderID, "Ramen Champion คนส่วนใหญ่ชอบรับประทานกันมากครับ :)");}
    }, 1000)
    setTimeout(function() {
      if(payload == 'eatSalang'){sendImageRobinsonFirst(senderID);}
      if(payload == 'eatJefferSteak'){sendImageRobinsonSecond(senderID);}
      if(payload == 'eatYayoi'){sendImageRobinsonThird(senderID);}
      if(payload == 'eatHotPot'){sendImageRobinsonFourth(senderID);}
      if(payload == 'eatTempura'){sendImageRobinsonFifth(senderID);}
      if(payload == 'eatRamenChampion'){sendImageRobinsonSixth(senderID);}
    }, 1500)
    setTimeout(function() {
      if(payload == 'eatSalang'){sendTextMessage(senderID, "ราคา : 250-500 บาท");}
      if(payload == 'eatJefferSteak'){sendTextMessage(senderID, "ราคา : 179-199 บาท");}
      if(payload == 'eatYayoi'){sendTextMessage(senderID, "ราคา : 125 บาท");}
      if(payload == 'eatHotPot'){sendTextMessage(senderID, "ราคา : 299 บาท");}
      if(payload == 'eatTempura'){sendTextMessage(senderID, "ราคา : 142 บาท");}
      if(payload == 'eatRamenChampion'){sendTextMessage(senderID, "ราคา : 155 บาท");}
    }, 2000)
    setTimeout(function() {
      if(payload == 'eatSalang'){sendTextMessage(senderID, "เวลาเปิด-ปิด : 10.00 - 21.00 น.");} 
      if(payload == 'eatJefferSteak'){sendTextMessage(senderID, "เวลาเปิด-ปิด : 10.00 - 21.00 น.");} 
      if(payload == 'eatYayoi'){sendTextMessage(senderID, "เวลาเปิด-ปิด : 09.00 - 10.00 - 21.00 น.");} 
      if(payload == 'eatHotPot'){sendTextMessage(senderID, "เวลาเปิด-ปิด : 09.00 - 10.00 - 21.00 น.");} 
      if(payload == 'eatTempura'){sendTextMessage(senderID, "เวลาเปิด-ปิด : 09.00 - 10.00 - 21.00 น.");} 
      if(payload == 'eatRamenChampion'){sendTextMessage(senderID, "เวลาเปิด-ปิด : 09.00 - 10.00 - 21.00 น.");} 
    }, 2500)
    setTimeout(function() {
      if(payload == 'eatSalang'){sendTextMessage(senderID, "วันหยุด : เปิดให้บริการทุกวัน");}
      if(payload == 'eatJefferSteak'){sendTextMessage(senderID, "วันหยุด : เปิดให้บริการทุกวัน");}
      if(payload == 'eatYayoi'){sendTextMessage(senderID, "วันหยุด : เปิดให้บริการทุกวัน");}
      if(payload == 'eatHotPot'){sendTextMessage(senderID, "วันหยุด : เปิดให้บริการทุกวัน");}
      if(payload == 'eatTempura'){sendTextMessage(senderID, "วันหยุด : เปิดให้บริการทุกวัน");}
      if(payload == 'eatRamenChampion'){sendTextMessage(senderID, "วันหยุด : เปิดให้บริการทุกวัน");}
    }, 3000)
  }
  /////////////////////////////ต้องการกินสิ่งนี้ บ้านเนินน้ำ/////////////////////
  else if(payload == 'eatGrilledPork'||payload == 'eatPigFried'||payload == 'eatDuck'||payload == 'eatSquid'||payload == 'eatPigSpicy'||payload == 'eatTomyumkung'){
    setTimeout(function() {
      if(payload == 'eatGrilledPork'){sendTextMessage(senderID, "โอเคครับ! คุณต้องการรับประทานคอหมูย่างที่สวนอาหาร บ้านเนินน้ำ ใช่มั้ยครับ");}
      if(payload == 'eatPigFried'){sendTextMessage(senderID, "โอเคครับ! คุณต้องการรับประทานขาหมูทอดกรอบที่สวนอาหาร บ้านเนินน้ำ ใช่มั้ยครับ");}
      if(payload == 'eatDuck'){sendTextMessage(senderID, "โอเคครับ! คุณต้องการรับประทานเป็ดทรงเครื่องที่สวนอาหาร บ้านเนินน้ำ ใช่มั้ยครับ");}
      if(payload == 'eatSquid'){sendTextMessage(senderID, "โอเคครับ! คุณต้องการรับประทานยำปลาหมึกที่สวนอาหาร บ้านเนินน้ำ ใช่มั้ยครับ");}
      if(payload == 'eatPigSpicy'){sendTextMessage(senderID, "โอเคครับ! คุณต้องการรับประทานผัดเผ็ดหมูป่าที่สวนอาหาร บ้านเนินน้ำ ใช่มั้ยครับ");}
      if(payload == 'eatTomyumkung'){sendTextMessage(senderID, "โอเคครับ! คุณต้องการรับประทานต้มยำกุ้งเล็กที่สวนอาหาร บ้านเนินน้ำ ใช่มั้ยครับ");}
    }, 500)
    setTimeout(function() {
      if(payload == 'eatGrilledPork'){sendTextMessage(senderID, "คอหมูย่าง คนส่วนใหญ่ชอบรับประทานกันมากครับ :)");}
      if(payload == 'eatPigFried'){sendTextMessage(senderID, "ขาหมูทอดกรอบ คนส่วนใหญ่ชอบรับประทานกันมากครับ :)");}
      if(payload == 'eatDuck'){sendTextMessage(senderID, "เป็ดทรงเครื่อง คนส่วนใหญ่ชอบรับประทานกันมากครับ :)");}
      if(payload == 'eatSquid'){sendTextMessage(senderID, "ยำปลาหมึก คนส่วนใหญ่ชอบรับประทานกันมากครับ :)");}
      if(payload == 'eatPigSpicy'){sendTextMessage(senderID, "ผัดเผ็ดหมูป่า คนส่วนใหญ่ชอบรับประทานกันมากครับ :)");}
      if(payload == 'eatTomyumkung'){sendTextMessage(senderID, "ต้มยำกุ้งเล็ก คนส่วนใหญ่ชอบรับประทานกันมากครับ :)");}
    }, 1000)
    setTimeout(function() {
      if(payload == 'eatGrilledPork'){sendImageBaannernnamFirst(senderID);}
      if(payload == 'eatPigFried'){sendImageBaannernnamSecond(senderID);}
      if(payload == 'eatDuck'){sendImageBaannernnamThird(senderID);}
      if(payload == 'eatSquid'){sendImageBaannernnamFourth(senderID);}
      if(payload == 'eatPigSpicy'){sendImageBaannernnamFifth(senderID);}
      if(payload == 'eatTomyumkung'){sendImageBaannernnamSixth(senderID);}
    }, 1500)
    setTimeout(function() {
      if(payload == 'eatGrilledPork'){sendTextMessage(senderID, "ราคา : 180 บาท");}
      if(payload == 'eatPigFried'){sendTextMessage(senderID, "ราคา : 380 บาท");}
      if(payload == 'eatDuck'){sendTextMessage(senderID, "ราคา : 350 บาท");}
      if(payload == 'eatSquid'){sendTextMessage(senderID, "ราคา : 180 บาท");}
      if(payload == 'eatPigSpicy'){sendTextMessage(senderID, "ราคา : 180 บาท");}
      if(payload == 'eatTomyumkung'){sendTextMessage(senderID, "ราคา : 170-220 บาท");}
    }, 2000)
    setTimeout(function() {
      if(payload == 'eatGrilledPork'){sendTextMessage(senderID, "เวลาเปิด-ปิด : 11.00-24.00 น.");} 
      if(payload == 'eatPigFried'){sendTextMessage(senderID, "เวลาเปิด-ปิด : 11.00-24.00 น.");} 
      if(payload == 'eatDuck'){sendTextMessage(senderID, "เวลาเปิด-ปิด : 11.00-24.00 น.");} 
      if(payload == 'eatSquid'){sendTextMessage(senderID, "เวลาเปิด-ปิด : 11.00-24.00 น.");} 
      if(payload == 'eatPigSpicy'){sendTextMessage(senderID, "เวลาเปิด-ปิด : 11.00-24.00 น.");} 
      if(payload == 'eatTomyumkung'){sendTextMessage(senderID, "เวลาเปิด-ปิด : 11.00-24.00 น.");} 
    }, 2500)
    setTimeout(function() {
      if(payload == 'eatGrilledPork'){sendTextMessage(senderID, "วันหยุด : เปิดให้บริการทุกวัน");}
      if(payload == 'eatPigFried'){sendTextMessage(senderID, "วันหยุด : เปิดให้บริการทุกวัน");}
      if(payload == 'eatDuck'){sendTextMessage(senderID, "วันหยุด : เปิดให้บริการทุกวัน");}
      if(payload == 'eatSquid'){sendTextMessage(senderID, "วันหยุด : เปิดให้บริการทุกวัน");}
      if(payload == 'eatPigSpicy'){sendTextMessage(senderID, "วันหยุด : เปิดให้บริการทุกวัน");}
      if(payload == 'eatTomyumkung'){sendTextMessage(senderID, "วันหยุด : เปิดให้บริการทุกวัน");}
    }, 3000)
  }
   /////////////////////////////ต้องการกินสิ่งนี้ ร้านชลชล/////////////////////
  else if(payload == 'eatChomCholFirst'||payload == 'eatChomCholSecond'||payload == 'eatChomCholThird'||payload == 'eatChomCholFourth'||payload == 'eatChomCholFifth'){
    setTimeout(function() {
      if(payload == 'eatChomCholFirst'){sendTextMessage(senderID, "โอเคครับ! คุณต้องการรับประทานส้มตำปูม้าที่ร้านอาหารชมชล ใช่มั้ยครับ");}
      if(payload == 'eatChomCholSecond'){sendTextMessage(senderID, "โอเคครับ! คุณต้องการรับประทานลาบปลาช่อนทอดที่ร้านอาหารชมชล ใช่มั้ยครับ");}
      if(payload == 'eatChomCholThird'){sendTextMessage(senderID, "โอเคครับ! คุณต้องการรับประทานทอดมันปลากรายที่ร้านอาหารชมชล ใช่มั้ยครับ");}
      if(payload == 'eatChomCholFourth'){sendTextMessage(senderID, "โอเคครับ! คุณต้องการรับประทานต้มยำกุ้งน้ำข้นที่ร้านอาหารชมชล ใช่มั้ยครับ");}
      if(payload == 'eatChomCholFifth'){sendTextMessage(senderID, "โอเคครับ! คุณต้องการรับประทานปลาเนื้ออ่อนทอดกระเทียมที่ร้านอาหารชมชล ใช่มั้ยครับ");}
    }, 500)
    setTimeout(function() {
      if(payload == 'eatChomCholFirst'){sendTextMessage(senderID, "ส้มตำปูม้า คนส่วนใหญ่ชอบรับประทานกันมากครับ :)");}
      if(payload == 'eatChomCholSecond'){sendTextMessage(senderID, "ลาบปลาช่อนทอด คนส่วนใหญ่ชอบรับประทานกันมากครับ :)");}
      if(payload == 'eatChomCholThird'){sendTextMessage(senderID, "ทอดมันปลากราย คนส่วนใหญ่ชอบรับประทานกันมากครับ :)");}
      if(payload == 'eatChomCholFourth'){sendTextMessage(senderID, "ต้มยำกุ้งน้ำข้น คนส่วนใหญ่ชอบรับประทานกันมากครับ :)");}
      if(payload == 'eatChomCholFifth'){sendTextMessage(senderID, "ปลาเนื้ออ่อนทอดกระเทียม คนส่วนใหญ่ชอบรับประทานกันมากครับ :)");}
    }, 1000)
    setTimeout(function() {
      if(payload == 'eatChomCholFirst'){sendImageChomCholFirst(senderID);}
      if(payload == 'eatChomCholSecond'){sendImageChomCholSecond(senderID);}
      if(payload == 'eatChomCholThird'){sendImageChomCholThird(senderID);}
      if(payload == 'eatChomCholFourth'){sendImageChomCholFourth(senderID);}
      if(payload == 'eatChomCholFifth'){sendImageChomCholFifth(senderID);}
    }, 1500)
    setTimeout(function() {
      if(payload == 'eatChomCholFirst'){sendTextMessage(senderID, "ราคา : 180 บาท");}
      if(payload == 'eatChomCholSecond'){sendTextMessage(senderID, "ราคา : 180 บาท");}
      if(payload == 'eatChomCholThird'){sendTextMessage(senderID, "ราคา : 150 บาท");}
      if(payload == 'eatChomCholFourth'){sendTextMessage(senderID, "ราคา : 200 บาท");}
      if(payload == 'eatChomCholFifth'){sendTextMessage(senderID, "ราคา : 180 บาท");}
    }, 2000)
    setTimeout(function() {
      if(payload == 'eatChomCholFirst'){sendTextMessage(senderID, "เวลาเปิด-ปิด : 09.00 – 22.00 น.");} 
      if(payload == 'eatChomCholSecond'){sendTextMessage(senderID, "เวลาเปิด-ปิด : 09.00 – 22.00 น.");} 
      if(payload == 'eatChomCholThird'){sendTextMessage(senderID, "เวลาเปิด-ปิด : 09.00 – 22.00 น.");} 
      if(payload == 'eatChomCholFourth'){sendTextMessage(senderID, "เวลาเปิด-ปิด : 09.00 – 22.00 น.");} 
      if(payload == 'eatChomCholFifth'){sendTextMessage(senderID, "เวลาเปิด-ปิด : 09.00 – 22.00 น.");}    
    }, 2500)
    setTimeout(function() {
      if(payload == 'eatChomCholFirst'){sendTextMessage(senderID, "วันหยุด : เปิดให้บริการทุกวัน");}
      if(payload == 'eatChomCholSecond'){sendTextMessage(senderID, "วันหยุด : เปิดให้บริการทุกวัน");}
      if(payload == 'eatChomCholThird'){sendTextMessage(senderID, "วันหยุด : เปิดให้บริการทุกวัน");}
      if(payload == 'eatChomCholFourth'){sendTextMessage(senderID, "วันหยุด : เปิดให้บริการทุกวัน");}
      if(payload == 'eatChomCholFifth'){sendTextMessage(senderID, "วันหยุด : เปิดให้บริการทุกวัน");}     
    }, 3000)
  }
  /////////////////////////////ต้องการกินสิ่งนี้ น่ำเฮียง โภชนา/////////////////////
  else if(payload == 'eatNamHiangFirst'||payload == 'eatNamHiangSecond'||payload == 'eatNamHiangThird'||payload == 'eatNamHiangFourth'||payload == 'eatNamHiangFifth'||payload == 'eatNamHiangSixth'){
    setTimeout(function() {
      if(payload == 'eatNamHiangFirst'){sendTextMessage(senderID, "โอเคครับ! คุณต้องการรับประทานกระดูกหมูอ่อนทอดกระเทียมพริกไทยที่ร้านน่ำเฮียง โภชนา (ฟ้ามุ่ย) ใช่มั้ยครับ");}
      if(payload == 'eatNamHiangSecond'){sendTextMessage(senderID, "โอเคครับ! คุณต้องการรับประทานผัดผักกระเฉดชลูดน้ำที่ร้านน่ำเฮียง โภชนา (ฟ้ามุ่ย) ใช่มั้ยครับ");}
      if(payload == 'eatNamHiangThird'){sendTextMessage(senderID, "โอเคครับ! คุณต้องการรับประทานทอดมันกุ้งที่ร้านน่ำเฮียง โภชนา (ฟ้ามุ่ย) ใช่มั้ยครับ");}
      if(payload == 'eatNamHiangFourth'){sendTextMessage(senderID, "โอเคครับ! คุณต้องการรับประทานมะระผัดไข่ที่ร้านน่ำเฮียง โภชนา (ฟ้ามุ่ย) ใช่มั้ยครับ");}
      if(payload == 'eatNamHiangFifth'){sendTextMessage(senderID, "โอเคครับ! คุณต้องการรับประทานต้มยำไก่บ้านที่ร้านน่ำเฮียง โภชนา (ฟ้ามุ่ย) ใช่มั้ยครับ");}
      if(payload == 'eatNamHiangSixth'){sendTextMessage(senderID, "โอเคครับ! คุณต้องการรับประทานปลาซิวทอดกรอบที่ร้านน่ำเฮียง โภชนา (ฟ้ามุ่ย) ใช่มั้ยครับ");}
    }, 500)
    setTimeout(function() {
      if(payload == 'eatNamHiangFirst'){sendTextMessage(senderID, "กระดูกหมูอ่อนทอดกระเทียมพริกไทย คนส่วนใหญ่ชอบรับประทานกันมากครับ :)");}
      if(payload == 'eatNamHiangSecond'){sendTextMessage(senderID, "ผัดผักกระเฉดชลูดน้ำ คนส่วนใหญ่ชอบรับประทานกันมากครับ :)");}
      if(payload == 'eatNamHiangThird'){sendTextMessage(senderID, "ทอดมันกุ้ง คนส่วนใหญ่ชอบรับประทานกันมากครับ :)");}
      if(payload == 'eatNamHiangFourth'){sendTextMessage(senderID, "มะระผัดไข่ คนส่วนใหญ่ชอบรับประทานกันมากครับ :)");}
      if(payload == 'eatNamHiangFifth'){sendTextMessage(senderID, "ต้มยำไก่บ้าน คนส่วนใหญ่ชอบรับประทานกันมากครับ :)");}
      if(payload == 'eatNamHiangSixth'){sendTextMessage(senderID, "ปลาซิวทอดกรอบ คนส่วนใหญ่ชอบรับประทานกันมากครับ :)");}
    }, 1000)
    setTimeout(function() {
      if(payload == 'eatNamHiangFirst'){sendImageNamHiangFirst(senderID);}
      if(payload == 'eatNamHiangSecond'){sendImageNamHiangSecond(senderID);}
      if(payload == 'eatNamHiangThird'){sendImageNamHiangThird(senderID);}
      if(payload == 'eatNamHiangFourth'){sendImageNamHiangFourth(senderID);}
      if(payload == 'eatNamHiangFifth'){sendImageNamHiangFifth(senderID);}
      if(payload == 'eatNamHiangSixth'){sendImageNamHiangSixth(senderID);}
    }, 1500)
    setTimeout(function() {
      if(payload == 'eatNamHiangFirst'){sendTextMessage(senderID, "ราคา : 300 บาท");}
      if(payload == 'eatNamHiangSecond'){sendTextMessage(senderID, "ราคา : 100-150 บาท");}
      if(payload == 'eatNamHiangThird'){sendTextMessage(senderID, "ราคา : 300-400 บาท");}
      if(payload == 'eatNamHiangFourth'){sendTextMessage(senderID, "ราคา : 300 บาท");}
      if(payload == 'eatNamHiangFifth'){sendTextMessage(senderID, "ราคา : 200 บาท");}
      if(payload == 'eatNamHiangSixth'){sendTextMessage(senderID, "ราคา : 300 บาท");}
    }, 2000)
    setTimeout(function() {
      if(payload == 'eatNamHiangFirst'){sendTextMessage(senderID, "เวลาเปิด-ปิด : 10.00-19.00 น.");} 
      if(payload == 'eatNamHiangSecond'){sendTextMessage(senderID, "เวลาเปิด-ปิด : 10.00-19.00 น.");} 
      if(payload == 'eatNamHiangThird'){sendTextMessage(senderID, "เวลาเปิด-ปิด : 10.00-19.00 น.");} 
      if(payload == 'eatNamHiangFourth'){sendTextMessage(senderID, "เวลาเปิด-ปิด : 10.00-19.00 น.");} 
      if(payload == 'eatNamHiangFifth'){sendTextMessage(senderID, "เวลาเปิด-ปิด : 10.00-19.00 น.");} 
      if(payload == 'eatNamHiangSixth'){sendTextMessage(senderID, "เวลาเปิด-ปิด : 10.00-19.00 น.");} 
    }, 2500)
    setTimeout(function() {
      if(payload == 'eatNamHiangFirst'){sendTextMessage(senderID, "วันหยุด : หยุดไม่แน่นอน");}
      if(payload == 'eatNamHiangSecond'){sendTextMessage(senderID, "วันหยุด : หยุดไม่แน่นอน");}
      if(payload == 'eatNamHiangThird'){sendTextMessage(senderID, "วันหยุด : หยุดไม่แน่นอน");}
      if(payload == 'eatNamHiangFourth'){sendTextMessage(senderID, "วันหยุด : หยุดไม่แน่นอน");}
      if(payload == 'eatNamHiangFifth'){sendTextMessage(senderID, "วันหยุด : หยุดไม่แน่นอน");}
      if(payload == 'eatNamHiangSixth'){sendTextMessage(senderID, "วันหยุด : หยุดไม่แน่นอน");}
    }, 3000)
  }
  /////////////////////////////ต้องการกินสิ่งนี้ แอ๊ดข้าวต้ม/////////////////////
  else if(payload == 'eatAddFirst'||payload == 'eatAddSecond'||payload == 'eatAddThird'||payload == 'eatAddFourth'||payload == 'eatAddFifth'||payload == 'eatAddSixth'){
    setTimeout(function() {
      if(payload == 'eatAddFirst'){sendTextMessage(senderID, "โอเคครับ! คุณต้องการรับประทานกระเฉดชลูดน้ำไฟแดงที่ร้านแอ๊ด ข้าวต้ม ใช่มั้ยครับ");}
      if(payload == 'eatAddSecond'){sendTextMessage(senderID, "โอเคครับ! คุณต้องการรับประทานผักบุ้งไฟแดงที่ร้านแอ๊ด ข้าวต้ม ใช่มั้ยครับ");}
      if(payload == 'eatAddThird'){sendTextMessage(senderID, "โอเคครับ! คุณต้องการรับประทานหมูผัดหนำเลี๊ยบที่ร้านแอ๊ด ข้าวต้ม ใช่มั้ยครับ");}
      if(payload == 'eatAddFourth'){sendTextMessage(senderID, "โอเคครับ! คุณต้องการรับประทานแกงป่าปลาเห็ดโคนที่ร้านแอ๊ด ข้าวต้ม ใช่มั้ยครับ");}
      if(payload == 'eatAddFifth'){sendTextMessage(senderID, "โอเคครับ! คุณต้องการรับประทานเกี้ยมฉ่ายกระเพาะหมูที่ร้านแอ๊ด ข้าวต้ม ใช่มั้ยครับ");}
      if(payload == 'eatAddSixth'){sendTextMessage(senderID, "โอเคครับ! คุณต้องการรับประทานปลาสลิดทอดที่ร้านแอ๊ด ข้าวต้ม ใช่มั้ยครับ");}
    }, 500)
    setTimeout(function() {
      if(payload == 'eatAddFirst'){sendTextMessage(senderID, "กระเฉดชลูดน้ำไฟแดง คนส่วนใหญ่ชอบรับประทานกันมากครับ :)");}
      if(payload == 'eatAddSecond'){sendTextMessage(senderID, "ผักบุ้งไฟแดง คนส่วนใหญ่ชอบรับประทานกันมากครับ :)");}
      if(payload == 'eatAddThird'){sendTextMessage(senderID, "หมูผัดหนำเลี๊ยบ คนส่วนใหญ่ชอบรับประทานกันมากครับ :)");}
      if(payload == 'eatAddFourth'){sendTextMessage(senderID, "แกงป่าปลาเห็ดโคน คนส่วนใหญ่ชอบรับประทานกันมากครับ :)");}
      if(payload == 'eatAddFifth'){sendTextMessage(senderID, "เกี้ยมฉ่ายกระเพาะหมู คนส่วนใหญ่ชอบรับประทานกันมากครับ :)");}
      if(payload == 'eatAddSixth'){sendTextMessage(senderID, "ปลาสลิดทอด คนส่วนใหญ่ชอบรับประทานกันมากครับ :)");}
    }, 1000)
    setTimeout(function() {
      if(payload == 'eatAddFirst'){sendImageAddFirst(senderID);}
      if(payload == 'eatAddSecond'){sendImageAddSecond(senderID);}
      if(payload == 'eatAddThird'){sendImageAddThird(senderID);}
      if(payload == 'eatAddFourth'){sendImageAddFourth(senderID);}
      if(payload == 'eatAddFifth'){sendImageAddFifth(senderID);}
      if(payload == 'eatAddSixth'){sendImageAddSixth(senderID);}
    }, 1500)
    setTimeout(function() {
      if(payload == 'eatAddFirst'){sendTextMessage(senderID, "ราคา : 40-60 บาท");}
      if(payload == 'eatAddSecond'){sendTextMessage(senderID, "ราคา : 30-60 บาท");}
      if(payload == 'eatAddThird'){sendTextMessage(senderID, "ราคา : 60 บาท");}
      if(payload == 'eatAddFourth'){sendTextMessage(senderID, "ราคา : 60 บาท");}
      if(payload == 'eatAddFifth'){sendTextMessage(senderID, "ราคา : 40-60 บาท");}
      if(payload == 'eatAddSixth'){sendTextMessage(senderID, "ราคา : 60 บาท");}
    }, 2000)
    setTimeout(function() {
      if(payload == 'eatAddFirst'){sendTextMessage(senderID, "เวลาเปิด-ปิด : 17.00-04.00 น.");} 
      if(payload == 'eatAddSecond'){sendTextMessage(senderID, "เวลาเปิด-ปิด : 17.00-04.00 น.");} 
      if(payload == 'eatAddThird'){sendTextMessage(senderID, "เวลาเปิด-ปิด : 17.00-04.00 น.");} 
      if(payload == 'eatAddFourth'){sendTextMessage(senderID, "เวลาเปิด-ปิด : 17.00-04.00 น.");} 
      if(payload == 'eatAddFifth'){sendTextMessage(senderID, "เวลาเปิด-ปิด : 17.00-04.00 น.");} 
      if(payload == 'eatAddSixth'){sendTextMessage(senderID, "เวลาเปิด-ปิด : 17.00-04.00 น.");} 
    }, 2500)
    setTimeout(function() {
      if(payload == 'eatAddFirst'){sendTextMessage(senderID, "วันหยุด : เปิดให้บริการทุกวัน");}
      if(payload == 'eatAddSecond'){sendTextMessage(senderID, "วันหยุด : เปิดให้บริการทุกวัน");}
      if(payload == 'eatAddThird'){sendTextMessage(senderID, "วันหยุด : เปิดให้บริการทุกวัน");}
      if(payload == 'eatAddFourth'){sendTextMessage(senderID, "วันหยุด : เปิดให้บริการทุกวัน");}
      if(payload == 'eatAddFifth'){sendTextMessage(senderID, "วันหยุด : เปิดให้บริการทุกวัน");}
      if(payload == 'eatAddSixth'){sendTextMessage(senderID, "วันหยุด : เปิดให้บริการทุกวัน");}
    }, 3000)
  }
   /////////////////////////////ต้องการกินสิ่งนี้ ปาล์มสวีทโฮม/////////////////////
  else if(payload == 'eatPalmFirst'||payload == 'eatPalmSecond'||payload == 'eatPalmThird'||payload == 'eatPalmFourth'||payload == 'eatPalmFifth'||payload == 'eatPalmSixth'){
    setTimeout(function() {
      if(payload == 'eatPalmFirst'){sendTextMessage(senderID, "โอเคครับ! คุณต้องการรับประทานไก่มะนาวที่ร้านอาหาร ปาล์มสวีทโฮม ใช่มั้ยครับ");}
      if(payload == 'eatPalmSecond'){sendTextMessage(senderID, "โอเคครับ! คุณต้องการรับประทานผักบุ้งไฟแดงที่ร้านอาหาร ปาล์มสวีทโฮม ใช่มั้ยครับ");}
      if(payload == 'eatPalmThird'){sendTextMessage(senderID, "โอเคครับ! คุณต้องการรับประทานยำกระเฉดชลูดนที่ร้านอาหาร ปาล์มสวีทโฮม ใช่มั้ยครับ");}
      if(payload == 'eatPalmFourth'){sendTextMessage(senderID, "โอเคครับ! คุณต้องการรับประทานผัดเผ็ดหมูป่าที่ร้านอาหาร ปาล์มสวีทโฮม ใช่มั้ยครับ");}
      if(payload == 'eatPalmFifth'){sendTextMessage(senderID, "โอเคครับ! คุณต้องการรับประทานแกงส้มแป๊ะซะที่ร้านอาหาร ปาล์มสวีทโฮม ใช่มั้ยครับ");}
      if(payload == 'eatPalmSixth'){sendTextMessage(senderID, "โอเคครับ! คุณต้องการรับประทานผัดเผ็ดปลาช่อนที่ร้านอาหาร ปาล์มสวีทโฮม ใช่มั้ยครับ");}
    }, 500)
    setTimeout(function() {
      if(payload == 'eatPalmFirst'){sendTextMessage(senderID, "ไก่มะนาว คนส่วนใหญ่ชอบรับประทานกันมากครับ :)");}
      if(payload == 'eatPalmSecond'){sendTextMessage(senderID, "ผักบุ้งไฟแดง คนส่วนใหญ่ชอบรับประทานกันมากครับ :)");}
      if(payload == 'eatPalmThird'){sendTextMessage(senderID, "ยำกระเฉดชลูดน คนส่วนใหญ่ชอบรับประทานกันมากครับ :)");}
      if(payload == 'eatPalmFourth'){sendTextMessage(senderID, "ผัดเผ็ดหมูป่า คนส่วนใหญ่ชอบรับประทานกันมากครับ :)");}
      if(payload == 'eatPalmFifth'){sendTextMessage(senderID, "แกงส้มแป๊ะซะ คนส่วนใหญ่ชอบรับประทานกันมากครับ :)");}
      if(payload == 'eatPalmSixth'){sendTextMessage(senderID, "ผัดเผ็ดปลาช่อน คนส่วนใหญ่ชอบรับประทานกันมากครับ :)");}
    }, 1000)
    setTimeout(function() {
      if(payload == 'eatPalmFirst'){sendImagePalmFirst(senderID);}
      if(payload == 'eatPalmSecond'){sendImagePalmSecond(senderID);}
      if(payload == 'eatPalmThird'){sendImagePalmThird(senderID);}
      if(payload == 'eatPalmFourth'){sendImagePalmFourth(senderID);}
      if(payload == 'eatPalmFifth'){sendImagePalmFifth(senderID);}
      if(payload == 'eatPalmSixth'){sendImagePalmSixth(senderID);}
    }, 1500)
    setTimeout(function() {
      if(payload == 'eatPalmFirst'){sendTextMessage(senderID, "ราคา : 300 บาท");}
      if(payload == 'eatPalmSecond'){sendTextMessage(senderID, "ราคา : 300 บาท");}
      if(payload == 'eatPalmThird'){sendTextMessage(senderID, "ราคา : 300 บาท");}
      if(payload == 'eatPalmFourth'){sendTextMessage(senderID, "ราคา : 300 บาท");}
      if(payload == 'eatPalmFifth'){sendTextMessage(senderID, "ราคา : 300 บาท");}
      if(payload == 'eatPalmSixth'){sendTextMessage(senderID, "ราคา : 300 บาท");}
    }, 2000)
    setTimeout(function() {
      if(payload == 'eatPalmFirst'){sendTextMessage(senderID, "เวลาเปิด-ปิด : 10.00-24.00 น.");} 
      if(payload == 'eatPalmSecond'){sendTextMessage(senderID, "เวลาเปิด-ปิด : 10.00-24.00 น.");} 
      if(payload == 'eatPalmThird'){sendTextMessage(senderID, "เวลาเปิด-ปิด : 10.00-24.00 น.");} 
      if(payload == 'eatPalmFourth'){sendTextMessage(senderID, "เวลาเปิด-ปิด : 10.00-24.00 น.");} 
      if(payload == 'eatPalmFifth'){sendTextMessage(senderID, "เวลาเปิด-ปิด : 10.00-24.00 น.");} 
      if(payload == 'eatPalmSixth'){sendTextMessage(senderID, "เวลาเปิด-ปิด : 10.00-24.00 น.");} 
    }, 2500)
    setTimeout(function() {
      if(payload == 'eatPalmFirst'){sendTextMessage(senderID, "วันหยุด : เปิดให้บริการทุกวัน");}
      if(payload == 'eatPalmSecond'){sendTextMessage(senderID, "วันหยุด : เปิดให้บริการทุกวัน");}
      if(payload == 'eatPalmThird'){sendTextMessage(senderID, "วันหยุด : เปิดให้บริการทุกวัน");}
      if(payload == 'eatPalmFourth'){sendTextMessage(senderID, "วันหยุด : เปิดให้บริการทุกวัน");}
      if(payload == 'eatPalmFifth'){sendTextMessage(senderID, "วันหยุด : เปิดให้บริการทุกวัน");}
      if(payload == 'eatPalmSixth'){sendTextMessage(senderID, "วันหยุด : เปิดให้บริการทุกวัน");}
    }, 3000)
  }
  /////////ต้องการเปลี่ยนเมนูอาหาร/////////////
  else if(payload=='changePalmFood'){menuFoodPalmSweetHome(senderID);}
  else if(payload=='changeAddFood'){menuFoodAdd(senderID);}
  else if(payload=='changeCafeFood'){menuFoodCafeKantary(senderID);}
  else if(payload=='changeRobinsonFood'){menuFoodRobinson(senderID);}
  else if(payload=='changeBaannernnamFood'){menuFoodBaannernnam(senderID);}
  else if(payload=='changeChomCholFood'){menuFoodChomChol(senderID);}
  else if(payload=='changeNamHiangFood'){menuFoodNamHiang(senderID);}
  /////////////แสดงรายละเอียดปามสวีทโอม///////////////
  else if(payload=='detailPalmFirst'||payload=='detailPalmSecond'||payload=='detailPalmThird'||payload=='detailPalmFourth'||payload=='detailPalmFifth'||payload=='detailPalmSixth'){
    setTimeout(function() {
      if(payload=='detailPalmFirst'||payload=='detailPalmSecond'||payload=='detailPalmThird'||payload=='detailPalmFourth'||payload=='detailPalmFifth'||payload=='detailPalmSixth'){mapReviewPalm(senderID);}  
      }, 500)
    setTimeout(function() { 
        if(payload=='detailPalmFirst'||payload=='detailPalmSecond'||payload=='detailPalmThird'||payload=='detailPalmFourth'||payload=='detailPalmFifth'||payload=='detailPalmSixth'){sendTextMessage(senderID, "นี้คือสิ่งที่คุณจะไป 🏠");}
      }, 1000)
    setTimeout(function() {
      if(payload == 'detailPalmFirst'){detailPalmFirst(senderID);}
      if(payload == 'detailPalmSecond'){detailPalmSecond(senderID);}
      if(payload == 'detailPalmThird'){detailPalmThird(senderID);}
      if(payload == 'detailPalmFourth'){detailPalmFourth(senderID);}
      if(payload == 'detailPalmFifth'){detailPalmFifth(senderID);}
      if(payload == 'detailPalmSixth'){detailPalmSixth(senderID);}
      }, 1500)
  }
  /////////////แสดงรายละเอียดแอ๊ดข้าวต้ม///////////////
  else if(payload=='detailAddFirst'||payload=='detailAddSecond'||payload=='detailAddThird'||payload=='detailAddFourth'||payload=='detailAddFifth'||payload=='detailAddSixth'){
    setTimeout(function() {
      if(payload=='detailAddFirst'||payload=='detailAddSecond'||payload=='detailAddThird'||payload=='detailAddFourth'||payload=='detailAddFifth'||payload=='detailAddSixth'){mapReviewAdd(senderID);}  
      }, 500)
    setTimeout(function() { 
        if(payload=='detailAddFirst'||payload=='detailAddSecond'||payload=='detailAddThird'||payload=='detailAddFourth'||payload=='detailAddFifth'||payload=='detailAddSixth'){sendTextMessage(senderID, "นี้คือสิ่งที่คุณจะไป 🏠");}
      }, 1000)
    setTimeout(function() {
      if(payload == 'detailAddFirst'){detailAddFirst(senderID);}
      if(payload == 'detailAddSecond'){detailAddSecond(senderID);}
      if(payload == 'detailAddThird'){detailAddThird(senderID);}
      if(payload == 'detailAddFourth'){detailAddFourth(senderID);}
      if(payload == 'detailAddFifth'){detailAddFifth(senderID);}
      if(payload == 'detailAddSixth'){detailAddSixth(senderID);}
      }, 1500)
  }
  /////////////แสดงรายละเอียดนำเฮียง///////////////
  else if(payload=='detailNamHiangFirst'||payload=='detailNamHiangSecond'||payload=='detailNamHiangThird'||payload=='detailNamHiangFourth'||payload=='detailNamHiangFifth'||payload=='detailNamHiangSixth'){
    setTimeout(function() {
      if(payload=='detailNamHiangFirst'||payload=='detailNamHiangSecond'||payload=='detailNamHiangThird'||payload=='detailNamHiangFourth'||payload=='detailNamHiangFifth'||payload=='detailNamHiangSixth'){mapReviewNamHiang(senderID);}  
      }, 500)
    setTimeout(function() { 
        if(payload=='detailNamHiangFirst'||payload=='detailNamHiangSecond'||payload=='detailNamHiangThird'||payload=='detailNamHiangFourth'||payload=='detailNamHiangFifth'||payload=='detailNamHiangSixth'){sendTextMessage(senderID, "นี้คือสิ่งที่คุณจะไป 🏠");}
      }, 1000)
    setTimeout(function() {
      if(payload == 'detailNamHiangFirst'){detailNamHiangFirst(senderID);}
      if(payload == 'detailNamHiangSecond'){detailNamHiangSecond(senderID);}
      if(payload == 'detailNamHiangThird'){detailNamHiangThird(senderID);}
      if(payload == 'detailNamHiangFourth'){detailNamHiangFourth(senderID);}
      if(payload == 'detailNamHiangFifth'){detailNamHiangFifth(senderID);}
      if(payload == 'detailNamHiangSixth'){detailNamHiangSixth(senderID);}
      }, 1500)
  }
  /////////////แสดงรายละเอียดชมชล///////////////
  else if(payload=='detailChomCholFirst'||payload=='detailChomCholSecond'||payload=='detailChomCholThird'||payload=='detailChomCholFourth'||payload=='detailChomCholFifth'){
    setTimeout(function() {
      if(payload=='detailChomCholFirst'||payload=='detailChomCholSecond'||payload=='detailChomCholThird'||payload=='detailChomCholFourth'||payload=='detailChomCholFifth'){mapReviewChomChol(senderID);}  
      }, 500)
    setTimeout(function() { 
        if(payload=='detailChomCholFirst'||payload=='detailChomCholSecond'||payload=='detailChomCholThird'||payload=='detailChomCholFourth'||payload=='detailChomCholFifth'){sendTextMessage(senderID, "นี้คือสิ่งที่คุณจะไป 🏠");}
      }, 1000)
    setTimeout(function() {
      if(payload == 'detailChomCholFirst'){detailChomCholFirst(senderID);}
      if(payload == 'detailChomCholSecond'){detailChomCholSecond(senderID);}
      if(payload == 'detailChomCholThird'){detailChomCholThird(senderID);}
      if(payload == 'detailChomCholFourth'){detailChomCholFourth(senderID);}
      if(payload == 'detailChomCholFifth'){detailChomCholFifth(senderID);}
     }, 1500)
  }
  /////////////แสดงรายละเอียดบ้านเนินน้ำ///////////////
  else if(payload=='detailBaannernnamFirst'||payload=='detailBaannernnamSecond'||payload=='detailBaannernnamThird'||payload=='detailBaannernnamFourth'||payload=='detailBaannernnamFifth'||payload=='detailBaannernnamSixth'){
    setTimeout(function() {
      if(payload=='detailBaannernnamFirst'||payload=='detailBaannernnamSecond'||payload=='detailBaannernnamThird'||payload=='detailBaannernnamFourth'||payload=='detailBaannernnamFifth'||payload=='detailBaannernnamSixth'){mapReviewBaannernnam(senderID);}  
      }, 500)
    setTimeout(function() { 
        if(payload=='detailBaannernnamFirst'||payload=='detailBaannernnamSecond'||payload=='detailBaannernnamThird'||payload=='detailBaannernnamFourth'||payload=='detailBaannernnamFifth'||payload=='detailBaannernnamSixth'){sendTextMessage(senderID, "นี้คือสิ่งที่คุณจะไป 🏠");}
      }, 1000)
    setTimeout(function() {
      if(payload == 'detailBaannernnamFirst'){detailBaannernnamFirst(senderID);}
      if(payload == 'detailBaannernnamSecond'){detailBaannernnamSecond(senderID);}
      if(payload == 'detailBaannernnamThird'){detailBaannernnamThird(senderID);}
      if(payload == 'detailBaannernnamFourth'){detailBaannernnamFourth(senderID);}
      if(payload == 'detailBaannernnamFifth'){detailBaannernnamFifth(senderID);}
      if(payload == 'detailBaannernnamSixth'){detailBaannernnamSixth(senderID);}
      }, 1500)
  }
  /////////////แสดงรายละเอียด cafe kantary///////////////
  else if(payload=='detailCafeFirst'||payload=='detailCafeSecond'||payload=='detailCafeThird'||payload=='detailCafeFourth'||payload=='detailCafeFifth'||payload=='detailCafeSixth'){
    setTimeout(function() {
      if(payload=='detailCafeFirst'||payload=='detailCafeSecond'||payload=='detailCafeThird'||payload=='detailCafeFourth'||payload=='detailCafeFifth'||payload=='detailCafeSixth'){mapReviewCafe(senderID);}  
      }, 500)
    setTimeout(function() { 
        if(payload=='detailCafeFirst'||payload=='detailCafeSecond'||payload=='detailCafeThird'||payload=='detailCafeFourth'||payload=='detailCafeFifth'||payload=='detailCafeSixth'){sendTextMessage(senderID, "นี้คือสิ่งที่คุณจะไป 🏠");}
      }, 1000)
    setTimeout(function() {
      if(payload == 'detailCafeFirst'){detailCafeFirst(senderID);}
      if(payload == 'detailCafeSecond'){detailCafeSecond(senderID);}
      if(payload == 'detailCafeThird'){detailCafeThird(senderID);}
      if(payload == 'detailCafeFourth'){detailCafeFourth(senderID);}
      if(payload == 'detailCafeFifth'){detailCafeFifth(senderID);}
      if(payload == 'detailCafeSixth'){detailCafeSixth(senderID);}
      }, 1500)
  }
  /////////////แสดงรายละเอียดโรบินสัน///////////////
  else if(payload=='detailRobinsonFirst'||payload=='detailRobinsonSecond'||payload=='detailRobinsonThird'||payload=='detailRobinsonFourth'||payload=='detailRobinsonFifth'||payload=='detailRobinsonSixth'){
    setTimeout(function() {
      if(payload == 'detailRobinsonFirst'){mapReviewSalang(senderID);}
      if(payload == 'detailRobinsonSecond'){mapReviewJefferSteak(senderID);}
      if(payload == 'detailRobinsonThird'){mapReviewYayoi(senderID);}
      if(payload == 'detailRobinsonFourth'){mapReviewHotPot(senderID);}
      if(payload == 'detailRobinsonFifth'){mapReviewYayoi(senderID);}
      if(payload == 'detailRobinsonSixth'){mapReviewRamenChampion(senderID);}  
      }, 500)
    setTimeout(function() { 
        if(payload=='detailRobinsonFirst'||payload=='detailRobinsonSecond'||payload=='detailRobinsonThird'||payload=='detailRobinsonFourth'||payload=='detailRobinsonFifth'||payload=='detailRobinsonSixth'){sendTextMessage(senderID, "นี้คือสิ่งที่คุณจะไป 🏠");}
      }, 1000)
    setTimeout(function() {
      if(payload == 'detailRobinsonFirst'){detailRobinsonFirst(senderID);}
      if(payload == 'detailRobinsonSecond'){detailRobinsonSecond(senderID);}
      if(payload == 'detailRobinsonThird'){detailRobinsonThird(senderID);}
      if(payload == 'detailRobinsonFourth'){detailRobinsonFourth(senderID);}
      if(payload == 'detailRobinsonFifth'){detailRobinsonFifth(senderID);}
      if(payload == 'detailRobinsonSixth'){detailRobinsonSixth(senderID);}
      }, 1500)
  }
  ///////ไปร้านนี้แน่นอน
  else if(payload=='sureRobinsonFirst'||payload=='sureCafeFirst'||payload=='sureBaannernnamFirst'||payload=='sureChomCholFirst'||payload=='sureNamHiangFirst'||payload=='sureAddFirst'||payload=='surePalmFirst'){
    setTimeout(function() {
      sendTextMessage(senderID, "ขอให้รับประทานให้อร่อยนะครับ :)");
      }, 500)
    setTimeout(function() {
      needYourHelpEnd(senderID);
      }, 1000)
  }
  else {
    var result = "";
  }
}

  /////////////แสดงรายละเอียดโรบินสัน///////////////
function detailRobinsonFirst(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"Topokki",
            item_url:"",
            image_url:"https://s3-ap-southeast-1.amazonaws.com/photo.wongnai.com/photos/2015/09/12/e18408e67b634f9d945f7382b27121a7.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แน่นอน! ไปที่นี้",
                payload:"sureRobinsonFirst"
              }, 
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changeRobinsonFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}
function detailRobinsonSecond(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"Wagyu Steak",
            item_url:"",
            image_url:"http://oknation.nationtv.tv/blog/home/user_data/file_data/201301/15/14980c201.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แน่นอน! ไปที่นี้",
                payload:"sureRobinsonFirst"
              }, 
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changeRobinsonFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}
function detailRobinsonThird(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"ํTakoyaki",
            item_url:"",
            image_url:"https://www.yayoirestaurants.com/uploads/image/96BE41CD-F01D-4E9B-85D1-6AB8B84A4C02.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แน่นอน! ไปที่นี้",
                payload:"sureRobinsonFirst"
              }, 
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changeRobinsonFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}
function detailRobinsonFourth(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"ํHot Pot Buffet",
            item_url:"",
            image_url:"http://2.bp.blogspot.com/-rtL6WPiASvM/Vn6w4mfVHuI/AAAAAAAABlI/6ygYNRreW4Q/s1600/%25E0%25B8%25AA%25E0%25B8%25A1%25E0%25B8%25B1%25E0%25B8%2584%25E0%25B8%25A3%25E0%25B8%2587%25E0%25B8%25B2%25E0%25B8%2599%2BPart%2BTime%2BHOT%2BPOT%2B%25E0%25B8%25AA%25E0%25B8%25B2%25E0%25B8%2582%25E0%25B8%25B2%25E0%25B9%2580%25E0%25B8%258B%25E0%25B9%2587%25E0%25B8%25A5%25E0%25B8%2597%25E0%25B8%25A3%25E0%25B8%25B1%25E0%25B8%25A5%25E0%25B8%259A%25E0%25B8%25B2%25E0%25B8%2587%25E0%25B8%2599%25E0%25B8%25B2%2B45%25E0%25B8%259A%25E0%25B8%25B2%25E0%25B8%2597%25E0%25B8%258A%25E0%25B8%25A1..jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แน่นอน! ไปที่นี้",
                payload:"sureRobinsonFirst"
              }, 
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changeRobinsonFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}
function detailRobinsonFifth(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"Tempura Somen",
            item_url:"",
            image_url:"https://www.yayoirestaurants.com/uploads/image/F5D45267-6E7A-46B2-81D2-81F2F96C1C23.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แน่นอน! ไปที่นี้",
                payload:"sureRobinsonFirst"
              }, 
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changeRobinsonFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}
function detailRobinsonSixth(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"ํRamen Champion",
            item_url:"",
            image_url:"https://www.yayoirestaurants.com/uploads/image/8D6E1B28-3E20-4865-86D0-493F1254C795.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แน่นอน! ไปที่นี้",
                payload:"sureRobinsonFirst"
              }, 
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changeRobinsonFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}
function mapReviewSalang(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text : "คุณสามารถชมรีวิวร้านอาหารและแผ่นที่ ที่จะพาคุณไปยังร้านอาหารแห่งนี้ได้ที่นี้",
            buttons: [{
              type:"web_url",
              url:"https://www.wongnai.com/restaurants/234323FX-salang-tokpokki-%E0%B9%82%E0%B8%A3%E0%B8%9A%E0%B8%B4%E0%B8%99%E0%B8%AA%E0%B8%B1%E0%B8%99-%E0%B8%9B%E0%B8%A3%E0%B8%B2%E0%B8%88%E0%B8%B5%E0%B8%99%E0%B8%9A%E0%B8%B8%E0%B8%A3%E0%B8%B5",
              title:"🎈 รีวิวร้านอาหาร"
            },
            {
              type:"web_url",
              url:"https://www.google.co.th/webhp?sourceid=chrome-instant&rlz=1C1NHXL_thTH718TH718&ion=1&espv=2&ie=UTF-8#q=robinson+%E0%B8%9B%E0%B8%A3%E0%B8%B2%E0%B8%88%E0%B8%B5%E0%B8%99%E0%B8%9A%E0%B8%B8%E0%B8%A3%E0%B8%B5&rflfq=1&rlha=0&rllag=14058997,101393556,280&tbm=lcl&tbs=lf:1,lf_ui:2,lf_pqs:EAE",
              title:"🎯 แผ่นที่"
            }]
        }
      }
    }
  };
  callSendAPI(messageData);
}
function mapReviewRamenChampion(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text : "คุณสามารถชมรีวิวร้านอาหารและแผ่นที่ ที่จะพาคุณไปยังร้านอาหารแห่งนี้ได้ที่นี้",
            buttons: [{
              type:"web_url",
              url:"https://www.wongnai.com/restaurants/184043kY-yayoi-%E0%B9%82%E0%B8%A3%E0%B8%9A%E0%B8%B4%E0%B8%99%E0%B8%AA%E0%B8%B1%E0%B8%99-%E0%B8%9B%E0%B8%A3%E0%B8%B2%E0%B8%88%E0%B8%B5%E0%B8%99%E0%B8%9A%E0%B8%B8%E0%B8%A3%E0%B8%B5",
              title:"🎈 รีวิวร้านอาหาร"
            },
            {
              type:"web_url",
              url:"https://www.google.co.th/webhp?sourceid=chrome-instant&rlz=1C1NHXL_thTH718TH718&ion=1&espv=2&ie=UTF-8#q=robinson+%E0%B8%9B%E0%B8%A3%E0%B8%B2%E0%B8%88%E0%B8%B5%E0%B8%99%E0%B8%9A%E0%B8%B8%E0%B8%A3%E0%B8%B5&rflfq=1&rlha=0&rllag=14058997,101393556,280&tbm=lcl&tbs=lf:1,lf_ui:2,lf_pqs:EAE",
              title:"🎯 แผ่นที่"
            }]
        }
      }
    }
  };
  callSendAPI(messageData);
}
function mapReviewYayoi(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text : "คุณสามารถชมรีวิวร้านอาหารและแผ่นที่ ที่จะพาคุณไปยังร้านอาหารแห่งนี้ได้ที่นี้",
            buttons: [{
              type:"web_url",
              url:"https://www.wongnai.com/restaurants/184043kY-yayoi-%E0%B9%82%E0%B8%A3%E0%B8%9A%E0%B8%B4%E0%B8%99%E0%B8%AA%E0%B8%B1%E0%B8%99-%E0%B8%9B%E0%B8%A3%E0%B8%B2%E0%B8%88%E0%B8%B5%E0%B8%99%E0%B8%9A%E0%B8%B8%E0%B8%A3%E0%B8%B5",
              title:"🎈 รีวิวร้านอาหาร"
            },
            {
              type:"web_url",
              url:"https://www.google.co.th/webhp?sourceid=chrome-instant&rlz=1C1NHXL_thTH718TH718&ion=1&espv=2&ie=UTF-8#q=robinson+%E0%B8%9B%E0%B8%A3%E0%B8%B2%E0%B8%88%E0%B8%B5%E0%B8%99%E0%B8%9A%E0%B8%B8%E0%B8%A3%E0%B8%B5&rflfq=1&rlha=0&rllag=14058997,101393556,280&tbm=lcl&tbs=lf:1,lf_ui:2,lf_pqs:EAE",
              title:"🎯 แผ่นที่"
            }]
        }
      }
    }
  };
  callSendAPI(messageData);
}
function mapReviewJefferSteak(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text : "คุณสามารถชมรีวิวร้านอาหารและแผ่นที่ ที่จะพาคุณไปยังร้านอาหารแห่งนี้ได้ที่นี้",
            buttons: [{
              type:"web_url",
              url:"http://oknation.nationtv.tv/blog/Joseph/2013/01/15/entry-1",
              title:"🎈 รีวิวร้านอาหาร"
            },
            {
              type:"web_url",
              url:"https://www.google.co.th/webhp?sourceid=chrome-instant&rlz=1C1NHXL_thTH718TH718&ion=1&espv=2&ie=UTF-8#q=robinson+%E0%B8%9B%E0%B8%A3%E0%B8%B2%E0%B8%88%E0%B8%B5%E0%B8%99%E0%B8%9A%E0%B8%B8%E0%B8%A3%E0%B8%B5&rflfq=1&rlha=0&rllag=14058997,101393556,280&tbm=lcl&tbs=lf:1,lf_ui:2,lf_pqs:EAE",
              title:"🎯 แผ่นที่"
            }]
        }
      }
    }
  };
  callSendAPI(messageData);
}
function mapReviewTakoyaki(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text : "คุณสามารถชมรีวิวร้านอาหารและแผ่นที่ ที่จะพาคุณไปยังร้านอาหารแห่งนี้ได้ที่นี้",
            buttons: [{
              type:"web_url",
              url:"https://www.wongnai.com/restaurants/184043kY-yayoi-%E0%B9%82%E0%B8%A3%E0%B8%9A%E0%B8%B4%E0%B8%99%E0%B8%AA%E0%B8%B1%E0%B8%99-%E0%B8%9B%E0%B8%A3%E0%B8%B2%E0%B8%88%E0%B8%B5%E0%B8%99%E0%B8%9A%E0%B8%B8%E0%B8%A3%E0%B8%B5",
              title:"🎈 รีวิวร้านอาหาร"
            },
            {
              type:"web_url",
              url:"https://www.google.co.th/webhp?sourceid=chrome-instant&rlz=1C1NHXL_thTH718TH718&ion=1&espv=2&ie=UTF-8#q=robinson+%E0%B8%9B%E0%B8%A3%E0%B8%B2%E0%B8%88%E0%B8%B5%E0%B8%99%E0%B8%9A%E0%B8%B8%E0%B8%A3%E0%B8%B5&rflfq=1&rlha=0&rllag=14058997,101393556,280&tbm=lcl&tbs=lf:1,lf_ui:2,lf_pqs:EAE",
              title:"🎯 แผ่นที่"
            }]
        }
      }
    }
  };
  callSendAPI(messageData);
}
function mapReviewHotPot(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text : "คุณสามารถชมรีวิวร้านอาหารและแผ่นที่ ที่จะพาคุณไปยังร้านอาหารแห่งนี้ได้ที่นี้",
            buttons: [{
              type:"web_url",
              url:"http://hotpot.co.th/",
              title:"🎈 รีวิวร้านอาหาร"
            },
            {
              type:"web_url",
              url:"https://www.google.co.th/webhp?sourceid=chrome-instant&rlz=1C1NHXL_thTH718TH718&ion=1&espv=2&ie=UTF-8#q=robinson+%E0%B8%9B%E0%B8%A3%E0%B8%B2%E0%B8%88%E0%B8%B5%E0%B8%99%E0%B8%9A%E0%B8%B8%E0%B8%A3%E0%B8%B5&rflfq=1&rlha=0&rllag=14058997,101393556,280&tbm=lcl&tbs=lf:1,lf_ui:2,lf_pqs:EAE",
              title:"🎯 แผ่นที่"
            }]
        }
      }
    }
  };
  callSendAPI(messageData);
}

 /////////////แสดงรายละเอียดน cafe kantary///////////////
function detailCafeFirst(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"ฮันนี่ โทสต",
            item_url:"",
            image_url:"http://www.cafekantary.com/images/example/HT_choco_whitebig.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แน่นอน! ไปที่นี้",
                payload:"sureCafeFirst"
              }, 
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changeCafeFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}
function detailCafeSecond(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"เบอร์รี่ เบอร์รี่ เครป",
            item_url:"",
            image_url:"http://www.cafekantary.com/images/example/crepe1_B.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แน่นอน! ไปที่นี้",
                payload:"sureCafeFirst"
              }, 
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changeCafeFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}
function detailCafeThird(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"ํคาราเมล วาฟเฟิล",
            item_url:"",
            image_url:"http://www.cafekantary.com/images/example/w2_b.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แน่นอน! ไปที่นี้",
                payload:"sureCafeFirst"
              }, 
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changeCafeFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}
function detailCafeFourth(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"สตอเบอร์รี่ วาฟเฟิล",
            item_url:"",
            image_url:"http://www.cafekantary.com/images/example/w1_b.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แน่นอน! ไปที่นี้",
                payload:"sureCafeFirst"
              }, 
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changeCafeFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}
function detailCafeFifth(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"โอ้ล้า ลา ฮันนี่โทสต์",
            item_url:"",
            image_url:"http://www.cafekantary.com/images/cake-update.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แน่นอน! ไปที่นี้",
                payload:"sureCafeFirst"
              }, 
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changeCafeFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}
function detailCafeSixth(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"ไอศครีมโฮมเมด",
            item_url:"",
            image_url:"http://www.cafekantary.com/images/gelato.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แน่นอน! ไปที่นี้",
                payload:"sureCafeFirst"
              }, 
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changeCafeFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}
function mapReviewCafe(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text : "คุณสามารถชมรีวิวร้านอาหารและแผ่นที่ ที่จะพาคุณไปยังร้านอาหารแห่งนี้ได้ที่นี้",
            buttons: [{
              type:"web_url",
              url:"http://pantip.com/topic/34017140",
              title:"🎈 รีวิวร้านอาหาร"
            },
            {
              type:"web_url",
              url:"https://www.google.co.th/maps/place/13%C2%B054'14.6%22N+101%C2%B034'39.2%22E/@13.904049,101.5753723,17z/data=!3m1!4b1!4m5!3m4!1s0x0:0x0!8m2!3d13.904049!4d101.577561",
              title:"🎯 แผ่นที่"
            }]
        }
      }
    }
  };
  callSendAPI(messageData);
}


  /////////////แสดงรายละเอียดนำเฮียง///////////////
function detailBaannernnamFirst(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"คอหมูย่าง",
            item_url:"",
            image_url:"https://3.bp.blogspot.com/-AOL0RYCwIFg/Vv8-bEVDvwI/AAAAAAAADCw/bgeu32RDx1UoxImeH-zAU0z5IYz4nAicg/s1600/12670891_953230498124388_7147210296053861375_n.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แน่นอน! ไปที่นี้",
                payload:"sureBaannernnamFirst"
              }, 
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changeBaannernnamFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}
function detailBaannernnamSecond(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"ขาหมูทอดกรอบ",
            item_url:"",
            image_url:"http://img.painaidii.com/images/20120930_127_1349021565_291754.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แน่นอน! ไปที่นี้",
                payload:"sureBaannernnamFirst"
              }, 
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changeBaannernnamFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}
function detailBaannernnamThird(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"ํเป็ดทรงเครื่อง",
            item_url:"",
            image_url:"https://s3-ap-southeast-1.amazonaws.com/photo.wongnai.com/photos/2014/08/29/a52128d66bb24e7080839cda4f45a36f.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แน่นอน! ไปที่นี้",
                payload:"sureBaannernnamFirst"
              }, 
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changeBaannernnamFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}
function detailBaannernnamFourth(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"ยำปลาหมึก",
            item_url:"",
            image_url:"https://s3-ap-southeast-1.amazonaws.com/photo.wongnai.com/photos/2016/06/11/bfed5f221ced417e9994156960471aaa.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แน่นอน! ไปที่นี้",
                payload:"sureBaannernnamFirst"
              }, 
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changeBaannernnamFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}
function detailBaannernnamFifth(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"ผัดเผ็ดหมูป่า",
            item_url:"",
            image_url:"http://www.kidtam.com/wp-content/uploads/2016/09/12-3.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แน่นอน! ไปที่นี้",
                payload:"sureBaannernnamFirst"
              }, 
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changeBaannernnamFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}
function detailBaannernnamSixth(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"ต้มยำกุ้งเล็ก",
            item_url:"",
            image_url:"http://www.doodiza.com/images/1605_1447997622.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แน่นอน! ไปที่นี้",
                payload:"sureBaannernnamFirst"
              }, 
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changeBaannernnamFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}
function mapReviewBaannernnam(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text : "คุณสามารถชมรีวิวร้านอาหารและแผ่นที่ ที่จะพาคุณไปยังร้านอาหารแห่งนี้ได้ที่นี้",
            buttons: [{
              type:"web_url",
              url:"https://www.wongnai.com/restaurants/86808vQ-%E0%B8%9A%E0%B9%89%E0%B8%B2%E0%B8%99%E0%B9%80%E0%B8%99%E0%B8%B4%E0%B8%99%E0%B8%99%E0%B9%89%E0%B8%B3",
              title:"🎈 รีวิวร้านอาหาร"
            },
            {
              type:"web_url",
              url:"https://www.google.co.th/maps/place/%E0%B8%A3%E0%B9%89%E0%B8%B2%E0%B8%99%E0%B8%AD%E0%B8%B2%E0%B8%AB%E0%B8%B2%E0%B8%A3%E0%B8%9A%E0%B9%89%E0%B8%B2%E0%B8%99%E0%B9%80%E0%B8%99%E0%B8%B4%E0%B8%99%E0%B8%99%E0%B9%89%E0%B8%B3/@13.9883639,101.7635005,15z/data=!4m5!3m4!1s0x0:0xbd56af87c21ab227!8m2!3d13.9883639!4d101.7635005",
              title:"🎯 แผ่นที่"
            }]
        }
      }
    }
  };
  callSendAPI(messageData);
}

/////////////แสดงรายละเอียดชมชล///////////////
function detailChomCholFirst(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"ส้มตำปูม้า",
            item_url:"",
            image_url:"https://s3-ap-southeast-1.amazonaws.com/photo.wongnai.com/photos/2015/01/03/82eeb8edf2404be0b4c96b2d81d809a7.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แน่นอน! ไปที่นี้",
                payload:"sureChomCholFirst"
              }, 
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changeChomCholFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}
function detailChomCholSecond(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"ลาบปลาช่อนทอด",
            item_url:"",
            image_url:"http://lenoircafe.net/wp-content/uploads/2013/03/%E0%B8%A5%E0%B8%B2%E0%B8%9A%E0%B8%9B%E0%B8%A5%E0%B8%B2%E0%B8%8A%E0%B9%88%E0%B8%AD%E0%B8%993-650.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แน่นอน! ไปที่นี้",
                payload:"sureChomCholFirst"
              }, 
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changeChomCholFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}
function detailChomCholThird(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"ทอดมันปลากราย",
            item_url:"",
            image_url:"http://archeep.smeleader.com/wp-content/uploads/2014/11/%E0%B8%97%E0%B8%AD%E0%B8%94%E0%B8%A1%E0%B8%B1%E0%B8%99%E0%B8%9B%E0%B8%A5%E0%B8%B2%E0%B8%81%E0%B8%A3%E0%B8%B2%E0%B8%A202-Medium.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แน่นอน! ไปที่นี้",
                payload:"sureChomCholFirst"
              }, 
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changeChomCholFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}
function detailChomCholFourth(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"ต้มยำกุ้งน้ำข้น",
            item_url:"",
            image_url:"http://food.mthai.com/app/uploads/2014/04/184615110-1.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แน่นอน! ไปที่นี้",
                payload:"sureChomCholFirst"
              }, 
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changeChomCholFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}
function detailChomCholFifth(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"ปลาเนื้ออ่อนทอดกระเทียม",
            item_url:"",
            image_url:"http://f.ptcdn.info/922/041/000/o5vl43d99sVRvnpZsgm-o.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แน่นอน! ไปที่นี้",
                payload:"sureChomCholFirst"
              }, 
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changeChomCholFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}
function mapReviewChomChol(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text : "คุณสามารถชมรีวิวร้านอาหารและแผ่นที่ ที่จะพาคุณไปยังร้านอาหารแห่งนี้ได้ที่นี้",
            buttons: [{
              type:"web_url",
              url:"http://zeekway.com/review-chom-chon-restaurant/",
              title:"🎈 รีวิวร้านอาหาร"
            },
            {
              type:"web_url",
              url:"https://www.google.co.th/maps/place/%E0%B8%A3%E0%B9%89%E0%B8%B2%E0%B8%99%E0%B8%AD%E0%B8%B2%E0%B8%AB%E0%B8%B2%E0%B8%A3%E0%B8%8A%E0%B8%A1%E0%B8%8A%E0%B8%A5/@14.0514584,101.4002116,15z/data=!4m2!3m1!1s0x0:0x406f3c9bbadb1df8?sa=X&ved=0ahUKEwiL9vie8bzQAhXGvo8KHSUiDPYQ_BIIdDAK",
              title:"🎯 แผ่นที่"
            }]
        }
      }
    }
  };
  callSendAPI(messageData);
}


  /////////////แสดงรายละเอียดนำเฮียง///////////////
function detailNamHiangFirst(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"กระดูกหมูอ่อนทอดกระเทียมพริกไทย",
            item_url:"",
            image_url:"http://i0.wp.com/s3-ap-southeast-1.amazonaws.com/ungsriwong/wp-content/uploads/2014/05/NumHiang_004.jpg?resize=1024%2C769",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แน่นอน! ไปที่นี้",
                payload:"sureNamHiangFirst"
              }, 
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changeNamHiangFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}
function detailNamHiangSecond(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"ผัดผักกระเฉดชลูดน้ำ",
            item_url:"",
            image_url:"http://i2.wp.com/ungsriwong.s3.amazonaws.com/wp-content/uploads/2014/05/NumHiang_005.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แน่นอน! ไปที่นี้",
                payload:"sureNamHiangFirst"
              }, 
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changeNamHiangFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}
function detailNamHiangThird(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"ทอดมันกุ้ง",
            item_url:"",
            image_url:"http://i1.wp.com/ungsriwong.s3.amazonaws.com/wp-content/uploads/2014/05/NumHiang_006.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แน่นอน! ไปที่นี้",
                payload:"sureNamHiangFirst"
              }, 
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changeNamHiangFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}
function detailNamHiangFourth(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"มะระผัดไข่",
            item_url:"",
            image_url:"http://i2.wp.com/ungsriwong.s3.amazonaws.com/wp-content/uploads/2014/05/NumHiang_007.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แน่นอน! ไปที่นี้",
                payload:"sureNamHiangFirst"
              }, 
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changeNamHiangFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}
function detailNamHiangFifth(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"ต้มยำไก่บ้าน",
            item_url:"",
            image_url:"http://i2.wp.com/ungsriwong.s3.amazonaws.com/wp-content/uploads/2014/05/NumHiang_008.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แน่นอน! ไปที่นี้",
                payload:"sureNamHiangFirst"
              }, 
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changeNamHiangFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}
function detailNamHiangSixth(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"ปลาซิวทอดกรอบ",
            item_url:"",
            image_url:"http://i1.wp.com/ungsriwong.s3.amazonaws.com/wp-content/uploads/2014/05/NumHiang_009.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แน่นอน! ไปที่นี้",
                payload:"sureNamHiangFirst"
              }, 
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changeNamHiangFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}
function mapReviewNamHiang(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text : "คุณสามารถชมรีวิวร้านอาหารและแผ่นที่ ที่จะพาคุณไปยังร้านอาหารแห่งนี้ได้ที่นี้",
            buttons: [{
              type:"web_url",
              url:"http://www.teerapat.com/2014/05/%E0%B8%99%E0%B9%88%E0%B8%B3%E0%B9%80%E0%B8%AE%E0%B8%B5%E0%B8%A2%E0%B8%87-%E0%B9%82%E0%B8%A0%E0%B8%8A%E0%B8%99%E0%B8%B2-%E0%B8%9F%E0%B9%89%E0%B8%B2%E0%B8%A1%E0%B8%B8%E0%B9%88%E0%B8%A2-%E0%B8%A3%E0%B9%89%E0%B8%B2%E0%B8%99%E0%B8%AD%E0%B8%A3%E0%B9%88%E0%B8%AD%E0%B8%A2%E0%B8%97%E0%B8%B5%E0%B9%88-%E0%B8%81%E0%B8%9A%E0%B8%B4%E0%B8%99%E0%B8%97%E0%B8%A3%E0%B9%8C%E0%B8%9A%E0%B8%B8%E0%B8%A3%E0%B8%B5-%E0%B8%9B%E0%B8%A3%E0%B8%B2%E0%B8%88%E0%B8%B5%E0%B8%99%E0%B8%9A%E0%B8%B8%E0%B8%A3%E0%B8%B5/",
              title:"🎈 รีวิวร้านอาหาร"
            },
            {
              type:"web_url",
              url:"https://www.google.co.th/maps/place/%E0%B8%99%E0%B9%88%E0%B8%B3%E0%B9%80%E0%B8%AE%E0%B8%B5%E0%B8%A2%E0%B8%87%E0%B9%82%E0%B8%A0%E0%B8%8A%E0%B8%99%E0%B8%B2+(%E0%B8%9F%E0%B9%89%E0%B8%B2%E0%B8%A1%E0%B8%B8%E0%B9%88%E0%B8%A2)/@13.9837664,101.7612909,15z/data=!4m2!3m1!1s0x0:0xf77cfe02a66acb5c?sa=X&ved=0ahUKEwiRwsyK7LzQAhWHl5QKHdoECQUQ_BIIdzAK",
              title:"🎯 แผ่นที่"
            }]
        }
      }
    }
  };
  callSendAPI(messageData);
}

////แสดงรายละเอียดแอ๊ดข้าวต้ม
function detailAddFirst(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"กระเฉดชลูดน้ำไฟแดง",
            item_url:"",
            image_url:"http://i2.wp.com/s3-ap-southeast-1.amazonaws.com/ungsriwong/wp-content/uploads/2014/05/AddKabin_004.jpg?resize=1024%2C768",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แน่นอน! ไปที่นี้",
                payload:"sureAddFirst"
              }, 
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changeAddFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}
function detailAddSecond(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"ผักบุ้งไฟแดง",
            item_url:"",
            image_url:"http://i2.wp.com/ungsriwong.s3.amazonaws.com/wp-content/uploads/2014/05/AddKabin_005.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แน่นอน! ไปที่นี้",
                payload:"sureAddFirst"
              }, 
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changeAddFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}
function detailAddThird(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"หมูผัดหนำเลี๊ยบ",
            item_url:"",
            image_url:"http://i0.wp.com/ungsriwong.s3.amazonaws.com/wp-content/uploads/2014/05/AddKabin_007.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แน่นอน! ไปที่นี้",
                payload:"sureAddFirst"
              }, 
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changeAddFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}
function detailAddFourth(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"แกงป่า ปลาเห็ดโคน",
            item_url:"",
            image_url:"http://i2.wp.com/ungsriwong.s3.amazonaws.com/wp-content/uploads/2014/05/AddKabin_008.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แน่นอน! ไปที่นี้",
                payload:"sureAddFirst"
              }, 
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changeAddFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}
function detailAddFifth(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"เกี้ยมฉ่ายกระเพาะหม",
            item_url:"",
            image_url:"http://i2.wp.com/ungsriwong.s3.amazonaws.com/wp-content/uploads/2014/05/AddKabin_010.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แน่นอน! ไปที่นี้",
                payload:"sureAddFirst"
              }, 
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changeAddFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}
function mapReviewAdd(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text : "คุณสามารถชมรีวิวร้านอาหารและแผ่นที่ ที่จะพาคุณไปยังร้านอาหารแห่งนี้ได้ที่นี้",
            buttons: [{
              type:"web_url",
              url:"http://www.teerapat.com/2014/05/%E0%B9%81%E0%B8%AD%E0%B9%8A%E0%B8%94-%E0%B8%82%E0%B9%89%E0%B8%B2%E0%B8%A7%E0%B8%95%E0%B9%89%E0%B8%A1-%E0%B8%81%E0%B8%9A%E0%B8%B4%E0%B8%99%E0%B8%97%E0%B8%A3%E0%B9%8C%E0%B8%9A%E0%B8%B8%E0%B8%A3%E0%B8%B5-%E0%B8%9B%E0%B8%A3%E0%B8%B2%E0%B8%88%E0%B8%B5%E0%B8%99%E0%B8%9A%E0%B8%B8%E0%B8%A3%E0%B8%B5/",
              title:"🎈 รีวิวร้านอาหาร"
            },
            {
              type:"web_url",
              url:"https://www.google.co.th/maps/place/%E0%B9%81%E0%B8%AD%E0%B9%8A%E0%B8%95%E0%B8%82%E0%B9%89%E0%B8%B2%E0%B8%A7%E0%B8%95%E0%B9%89%E0%B8%A1+%E0%B8%81%E0%B8%9A%E0%B8%B4%E0%B8%99%E0%B8%97%E0%B8%A3%E0%B9%8C%E0%B8%9A%E0%B8%B8%E0%B8%A3%E0%B8%B5/@13.9841573,101.7638516,15z/data=!4m5!3m4!1s0x0:0xa32382529672b8f0!8m2!3d13.9841573!4d101.7638516",
              title:"🎯 แผ่นที่"
            }]
        }
      }
    }
  };
  callSendAPI(messageData);
}

/////////////แสดงรายละเอียดนำเฮียง///////////////
function detailNamHiangFirst(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"กระดูกหมูอ่อนทอดกระเทียมพริกไทย",
            item_url:"",
            image_url:"http://i0.wp.com/s3-ap-southeast-1.amazonaws.com/ungsriwong/wp-content/uploads/2014/05/NumHiang_004.jpg?resize=1024%2C769",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แน่นอน! ไปที่นี้",
                payload:"sureNamHiangFirst"
              }, 
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changeNamHiangFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}
function detailNamHiangSecond(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"ผัดผักกระเฉดชลูดน",
            item_url:"",
            image_url:"http://i2.wp.com/ungsriwong.s3.amazonaws.com/wp-content/uploads/2014/05/NumHiang_005.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แน่นอน! ไปที่นี้",
                payload:"sureNamHiangFirst"
              }, 
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changeNamHiangFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}
function detailNamHiangThird(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"ทอดมันกุ้ง",
            item_url:"",
            image_url:"http://i1.wp.com/ungsriwong.s3.amazonaws.com/wp-content/uploads/2014/05/NumHiang_006.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แน่นอน! ไปที่นี้",
                payload:"sureNamHiangFirst"
              }, 
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changeNamHiangFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}
function detailNamHiangFourth(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"มะระผัดไข่",
            item_url:"",
            image_url:"http://i2.wp.com/ungsriwong.s3.amazonaws.com/wp-content/uploads/2014/05/NumHiang_007.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แน่นอน! ไปที่นี้",
                payload:"sureNamHiangFirst"
              }, 
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changeNamHiangFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}
function detailNamHiangFifth(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"ต้มยำไก่บ้าน",
            item_url:"",
            image_url:"http://i2.wp.com/ungsriwong.s3.amazonaws.com/wp-content/uploads/2014/05/NumHiang_008.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แน่นอน! ไปที่นี้",
                payload:"sureNamHiangFirst"
              }, 
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changeNamHiangFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}
function detailNamHiangSixth(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"ปลาซิวทอดกรอบ",
            item_url:"",
            image_url:"http://i1.wp.com/ungsriwong.s3.amazonaws.com/wp-content/uploads/2014/05/NumHiang_009.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แน่นอน! ไปที่นี้",
                payload:"sureNamHiangFirst"
              }, 
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changeNamHiangFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}
function mapReviewNamHiang(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text : "คุณสามารถชมรีวิวร้านอาหารและแผ่นที่ ที่จะพาคุณไปยังร้านอาหารแห่งนี้ได้ที่นี้",
            buttons: [{
              type:"web_url",
              url:"http://www.teerapat.com/2014/05/%E0%B8%99%E0%B9%88%E0%B8%B3%E0%B9%80%E0%B8%AE%E0%B8%B5%E0%B8%A2%E0%B8%87-%E0%B9%82%E0%B8%A0%E0%B8%8A%E0%B8%99%E0%B8%B2-%E0%B8%9F%E0%B9%89%E0%B8%B2%E0%B8%A1%E0%B8%B8%E0%B9%88%E0%B8%A2-%E0%B8%A3%E0%B9%89%E0%B8%B2%E0%B8%99%E0%B8%AD%E0%B8%A3%E0%B9%88%E0%B8%AD%E0%B8%A2%E0%B8%97%E0%B8%B5%E0%B9%88-%E0%B8%81%E0%B8%9A%E0%B8%B4%E0%B8%99%E0%B8%97%E0%B8%A3%E0%B9%8C%E0%B8%9A%E0%B8%B8%E0%B8%A3%E0%B8%B5-%E0%B8%9B%E0%B8%A3%E0%B8%B2%E0%B8%88%E0%B8%B5%E0%B8%99%E0%B8%9A%E0%B8%B8%E0%B8%A3%E0%B8%B5/",
              title:"🎈 รีวิวร้านอาหาร"
            },
            {
              type:"web_url",
              url:"https://www.google.co.th/maps/place/%E0%B8%99%E0%B9%88%E0%B8%B3%E0%B9%80%E0%B8%AE%E0%B8%B5%E0%B8%A2%E0%B8%87%E0%B9%82%E0%B8%A0%E0%B8%8A%E0%B8%99%E0%B8%B2+(%E0%B8%9F%E0%B9%89%E0%B8%B2%E0%B8%A1%E0%B8%B8%E0%B9%88%E0%B8%A2)/@13.9837664,101.7612909,15z/data=!4m2!3m1!1s0x0:0xf77cfe02a66acb5c?sa=X&ved=0ahUKEwiRwsyK7LzQAhWHl5QKHdoECQUQ_BIIdzAK",
              title:"🎯 แผ่นที่"
            }]
        }
      }
    }
  };
  callSendAPI(messageData);
}

////แสดงรายละเอียดแอ๊ดข้าวต้ม
function detailAddFirst(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"กระเฉดชลูดน้ำไฟแดง",
            item_url:"",
            image_url:"http://i2.wp.com/s3-ap-southeast-1.amazonaws.com/ungsriwong/wp-content/uploads/2014/05/AddKabin_004.jpg?resize=1024%2C768",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แน่นอน! ไปที่นี้",
                payload:"sureAddFirst"
              }, 
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changeAddFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}
function detailAddSecond(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"ผักบุ้งไฟแดง",
            item_url:"",
            image_url:"http://i2.wp.com/ungsriwong.s3.amazonaws.com/wp-content/uploads/2014/05/AddKabin_005.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แน่นอน! ไปที่นี้",
                payload:"sureAddFirst"
              }, 
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changeAddFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}
function detailAddThird(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"หมูผัดหนำเลี๊ยบ",
            item_url:"",
            image_url:"http://i0.wp.com/ungsriwong.s3.amazonaws.com/wp-content/uploads/2014/05/AddKabin_007.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แน่นอน! ไปที่นี้",
                payload:"sureAddFirst"
              }, 
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changeAddFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}
function detailAddFourth(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"แกงป่า ปลาเห็ดโคน",
            item_url:"",
            image_url:"http://i2.wp.com/ungsriwong.s3.amazonaws.com/wp-content/uploads/2014/05/AddKabin_008.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แน่นอน! ไปที่นี้",
                payload:"sureAddFirst"
              }, 
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changeAddFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}
function detailAddFifth(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"เกี้ยมฉ่ายกระเพาะหม",
            item_url:"",
            image_url:"http://i2.wp.com/ungsriwong.s3.amazonaws.com/wp-content/uploads/2014/05/AddKabin_010.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แน่นอน! ไปที่นี้",
                payload:"sureAddFirst"
              }, 
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changeAddFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}
function detailAddSixth(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"ปลาสลิดทอด",
            item_url:"",
            image_url:"http://i1.wp.com/ungsriwong.s3.amazonaws.com/wp-content/uploads/2014/05/AddKabin_009.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แน่นอน! ไปที่นี้",
                payload:"sureAddFirst"
              }, 
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changeAddFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}
function mapReviewAdd(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text : "คุณสามารถชมรีวิวร้านอาหารและแผ่นที่ ที่จะพาคุณไปยังร้านอาหารแห่งนี้ได้ที่นี้",
            buttons: [{
              type:"web_url",
              url:"http://www.teerapat.com/2014/05/%E0%B9%81%E0%B8%AD%E0%B9%8A%E0%B8%94-%E0%B8%82%E0%B9%89%E0%B8%B2%E0%B8%A7%E0%B8%95%E0%B9%89%E0%B8%A1-%E0%B8%81%E0%B8%9A%E0%B8%B4%E0%B8%99%E0%B8%97%E0%B8%A3%E0%B9%8C%E0%B8%9A%E0%B8%B8%E0%B8%A3%E0%B8%B5-%E0%B8%9B%E0%B8%A3%E0%B8%B2%E0%B8%88%E0%B8%B5%E0%B8%99%E0%B8%9A%E0%B8%B8%E0%B8%A3%E0%B8%B5/",
              title:"🎈 รีวิวร้านอาหาร"
            },
            {
              type:"web_url",
              url:"https://www.google.co.th/maps/place/%E0%B9%81%E0%B8%AD%E0%B9%8A%E0%B8%95%E0%B8%82%E0%B9%89%E0%B8%B2%E0%B8%A7%E0%B8%95%E0%B9%89%E0%B8%A1+%E0%B8%81%E0%B8%9A%E0%B8%B4%E0%B8%99%E0%B8%97%E0%B8%A3%E0%B9%8C%E0%B8%9A%E0%B8%B8%E0%B8%A3%E0%B8%B5/@13.9841573,101.7638516,15z/data=!4m5!3m4!1s0x0:0xa32382529672b8f0!8m2!3d13.9841573!4d101.7638516",
              title:"🎯 แผ่นที่"
            }]
        }
      }
    }
  };
  callSendAPI(messageData);
}

////แสดงรายละเอียดปามสวีทโอม
function detailPalmFirst(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"ไก่มะนาว",
            item_url:"",
            image_url:"http://i1.wp.com/ungsriwong.s3.amazonaws.com/wp-content/uploads/2014/05/PalmSweetHome_003.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แน่นอน! ไปที่นี้",
                payload:"surePalmFirst"
              }, 
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changePalmFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}
function detailPalmSecond(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"ผักบุ้งไฟแดง",
            item_url:"",
            image_url:"http://i2.wp.com/ungsriwong.s3.amazonaws.com/wp-content/uploads/2014/05/PalmSweetHome_001.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แน่นอน! ไปที่นี้",
                payload:"surePalmFirst"
              }, 
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changePalmFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}
function detailPalmThird(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"ยำกระเฉดชลูดน้ำ",
            item_url:"",
            image_url:"http://i1.wp.com/ungsriwong.s3.amazonaws.com/wp-content/uploads/2014/05/PalmSweetHome_004.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แน่นอน! ไปที่นี้",
                payload:"surePalmFirst"
              }, 
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changePalmFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}
function detailPalmFourth(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"ผัดเผ็ดหมูป่า",
            item_url:"",
            image_url:"http://i2.wp.com/ungsriwong.s3.amazonaws.com/wp-content/uploads/2014/05/PalmSweetHome_007.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แน่นอน! ไปที่นี้",
                payload:"surePalmFirst"
              }, 
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changePalmFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}
function detailPalmFifth(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"แกงส้มแป๊ะซะ",
            item_url:"",
            image_url:"http://i0.wp.com/ungsriwong.s3.amazonaws.com/wp-content/uploads/2014/05/PalmSweetHome_005.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แน่นอน! ไปที่นี้",
                payload:"surePalmFirst"
              }, 
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changePalmFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}
function detailPalmSixth(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"ผัดเผ็ดปลาช่อน",
            item_url:"",
            image_url:"http://i2.wp.com/ungsriwong.s3.amazonaws.com/wp-content/uploads/2014/05/PalmSweetHome_002.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แน่นอน! ไปที่นี้",
                payload:"surePalmFirst"
              }, 
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changePalmFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}
function mapReviewPalm(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text : "คุณสามารถชมรีวิวร้านอาหารและแผ่นที่ ที่จะพาคุณไปยังร้านอาหารแห่งนี้ได้ที่นี้",
            buttons: [{
              type:"web_url",
              url:"http://www.teerapat.com/2014/05/%E0%B8%A3%E0%B9%89%E0%B8%B2%E0%B8%99%E0%B8%AD%E0%B8%B2%E0%B8%AB%E0%B8%B2%E0%B8%A3-%E0%B8%9B%E0%B8%B2%E0%B8%A5%E0%B9%8C%E0%B8%A1%E0%B8%AA%E0%B8%A7%E0%B8%B5%E0%B8%97%E0%B9%82%E0%B8%AE%E0%B8%A1-%E0%B8%81%E0%B8%9A%E0%B8%B4%E0%B8%99%E0%B8%97%E0%B8%A3%E0%B9%8C%E0%B8%9A%E0%B8%B8%E0%B8%A3%E0%B8%B5-%E0%B8%9B%E0%B8%A3%E0%B8%B2%E0%B8%88%E0%B8%B5%E0%B8%99%E0%B8%9A%E0%B8%B8%E0%B8%A3%E0%B8%B5/",
              title:"🎈 รีวิวร้านอาหาร"
            },
            {
              type:"web_url",
              url:"https://www.google.co.th/maps/place/%E0%B8%9B%E0%B8%B2%E0%B8%A5%E0%B9%8C%E0%B8%A1%E0%B8%AA%E0%B8%A7%E0%B8%B5%E0%B8%97%E0%B9%82%E0%B8%AE%E0%B8%A1+(Palm+sweet+home)/@13.9831288,101.7684302,15z/data=!4m5!3m4!1s0x0:0x530a91dc0a6a290!8m2!3d13.9831288!4d101.7684302",
              title:"🎯 แผ่นที่"
            }]
        }
      }
    }
  };
  callSendAPI(messageData);
}

////image food ปาล์มสวีทโฮม
function sendImagePalmFirst(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"ไก่มะนาว",
            item_url:"",
            image_url:"http://i1.wp.com/ungsriwong.s3.amazonaws.com/wp-content/uploads/2014/05/PalmSweetHome_003.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แสดงรายละเอียด",
                payload:"detailPalmFirst"
              },
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changePalmFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}
function sendImagePalmSecond(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"ผักบุ้งไฟแดง",
            item_url:"",
            image_url:"http://i2.wp.com/ungsriwong.s3.amazonaws.com/wp-content/uploads/2014/05/PalmSweetHome_001.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แสดงรายละเอียด",
                payload:"detailPalmSecond"
              },
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changePalmFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}
function sendImagePalmThird(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"ยำกระเฉดชลูดน้ำ",
            item_url:"",
            image_url:"http://i1.wp.com/ungsriwong.s3.amazonaws.com/wp-content/uploads/2014/05/PalmSweetHome_004.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แสดงรายละเอียด",
                payload:"detailPalmThird"
              },
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changePalmFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}
function sendImagePalmFourth(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"ํผัดเผ็ดหมูป่า",
            item_url:"",
            image_url:"http://i2.wp.com/ungsriwong.s3.amazonaws.com/wp-content/uploads/2014/05/PalmSweetHome_007.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แสดงรายละเอียด",
                payload:"detailPalmFourth"
              },
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changePalmFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}
function sendImagePalmFifth(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"ํแกงส้มแป๊ะซะ",
            item_url:"",
            image_url:"http://i0.wp.com/ungsriwong.s3.amazonaws.com/wp-content/uploads/2014/05/PalmSweetHome_005.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แสดงรายละเอียด",
                payload:"detailPalmFifth"
              },
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changePalmFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}
function sendImagePalmSixth(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"ผัดเผ็ดปลาช่อน",
            item_url:"",
            image_url:"http://i2.wp.com/ungsriwong.s3.amazonaws.com/wp-content/uploads/2014/05/PalmSweetHome_002.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แสดงรายละเอียด",
                payload:"detailPalmSixth"
              },
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changePalmFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}

////image food แอ็ดข้าวต้ม
function sendImageAddFirst(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"กระเฉดชลูดน้ำไฟแดง",
            item_url:"",
            image_url:"http://i2.wp.com/s3-ap-southeast-1.amazonaws.com/ungsriwong/wp-content/uploads/2014/05/AddKabin_004.jpg?resize=1024%2C768",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แสดงรายละเอียด",
                payload:"detailAddFirst"
              },
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changeAddFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}
function sendImageAddSecond(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"ผักบุ้งไฟแดง",
            item_url:"",
            image_url:"http://i2.wp.com/ungsriwong.s3.amazonaws.com/wp-content/uploads/2014/05/AddKabin_005.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แสดงรายละเอียด",
                payload:"detailAddSecond"
              },
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changeAddFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}
function sendImageAddThird(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"ํหมูผัดหนำเลี๊ยบ",
            item_url:"",
            image_url:"http://i0.wp.com/ungsriwong.s3.amazonaws.com/wp-content/uploads/2014/05/AddKabin_007.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แสดงรายละเอียด",
                payload:"detailAddThird"
              },
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changeAddFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}
function sendImageAddFourth(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"ํํแกงป่า ปลาเห็ดโคน",
            item_url:"",
            image_url:"http://i2.wp.com/ungsriwong.s3.amazonaws.com/wp-content/uploads/2014/05/AddKabin_008.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แสดงรายละเอียด",
                payload:"detailAddFourth"
              },
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changeAddFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}
function sendImageAddFifth(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"ํเกี้ยมฉ่ายกระเพาะหม",
            item_url:"",
            image_url:"http://i2.wp.com/ungsriwong.s3.amazonaws.com/wp-content/uploads/2014/05/AddKabin_010.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แสดงรายละเอียด",
                payload:"detailAddFifth"
              },
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changeAddFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}
function sendImageAddSixth(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"ปลาสลิดทอด",
            item_url:"",
            image_url:"http://i1.wp.com/ungsriwong.s3.amazonaws.com/wp-content/uploads/2014/05/AddKabin_009.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แสดงรายละเอียด",
                payload:"detailAddSixth"
              },
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changeAddFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}

////image food NamHiang
function sendImageNamHiangFirst(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"กระดูกหมูอ่อนทอดกระเทียมพริกไทย",
            item_url:"",
            image_url:"http://i0.wp.com/s3-ap-southeast-1.amazonaws.com/ungsriwong/wp-content/uploads/2014/05/NumHiang_004.jpg?resize=1024%2C769",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แสดงรายละเอียด",
                payload:"detailNamHiangFirst"
              },
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changeNamHiangFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}
function sendImageNamHiangSecond(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"ผัดผักกระเฉดชลูดน้ำ",
            item_url:"",
            image_url:"http://i2.wp.com/ungsriwong.s3.amazonaws.com/wp-content/uploads/2014/05/NumHiang_005.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แสดงรายละเอียด",
                payload:"detailNamHiangSecond"
              },
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changeNamHiangFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}
function sendImageNamHiangThird(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"ํํทอดมันกุ้ง",
            item_url:"",
            image_url:"http://i1.wp.com/ungsriwong.s3.amazonaws.com/wp-content/uploads/2014/05/NumHiang_006.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แสดงรายละเอียด",
                payload:"detailNamHiangThird"
              },
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changeNamHiangFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}
function sendImageNamHiangFourth(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"ํมะระผัดไข่",
            item_url:"",
            image_url:"http://i2.wp.com/ungsriwong.s3.amazonaws.com/wp-content/uploads/2014/05/NumHiang_007.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แสดงรายละเอียด",
                payload:"detailNamHiangFourth"
              },
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changeNamHiangFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}
function sendImageNamHiangFifth(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"ต้มยำไก่บ้าน",
            item_url:"",
            image_url:"http://i2.wp.com/ungsriwong.s3.amazonaws.com/wp-content/uploads/2014/05/NumHiang_008.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แสดงรายละเอียด",
                payload:"detailNamHiangFifth"
              },
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changeNamHiangFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}
function sendImageNamHiangSixth(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"ํปลาซิวทอดกรอบ",
            item_url:"",
            image_url:"http://i1.wp.com/ungsriwong.s3.amazonaws.com/wp-content/uploads/2014/05/NumHiang_009.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แสดงรายละเอียด",
                payload:"detailNamHiangSixth"
              },
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changeNamHiangFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}

////image food ChomCholFifth
function sendImageChomCholFirst(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"ส้มตำปูม้า",
            item_url:"",
            image_url:"https://s3-ap-southeast-1.amazonaws.com/photo.wongnai.com/photos/2015/01/03/82eeb8edf2404be0b4c96b2d81d809a7.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แสดงรายละเอียด",
                payload:"detailChomCholFirst"
              },
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changeChomCholFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}
function sendImageChomCholSecond(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"ลาบปลาช่อนทอด",
            item_url:"",
            image_url:"http://lenoircafe.net/wp-content/uploads/2013/03/%E0%B8%A5%E0%B8%B2%E0%B8%9A%E0%B8%9B%E0%B8%A5%E0%B8%B2%E0%B8%8A%E0%B9%88%E0%B8%AD%E0%B8%993-650.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แสดงรายละเอียด",
                payload:"detailChomCholSecond"
              },
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changeChomCholFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}
function sendImageChomCholThird(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"ํํทอดมันปลากราย",
            item_url:"",
            image_url:"http://archeep.smeleader.com/wp-content/uploads/2014/11/%E0%B8%97%E0%B8%AD%E0%B8%94%E0%B8%A1%E0%B8%B1%E0%B8%99%E0%B8%9B%E0%B8%A5%E0%B8%B2%E0%B8%81%E0%B8%A3%E0%B8%B2%E0%B8%A202-Medium.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แสดงรายละเอียด",
                payload:"detailChomCholThird"
              },
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changeChomCholFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}
function sendImageChomCholFourth(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"ํต้มยำกุ้งน้ำข้น",
            item_url:"",
            image_url:"http://food.mthai.com/app/uploads/2014/04/184615110-1.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แสดงรายละเอียด",
                payload:"detailChomCholFourth"
              },
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changeChomCholFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}
function sendImageChomCholFifth(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"ํํปลาเนื้ออ่อนทอดกระเทียม",
            item_url:"",
            image_url:"http://f.ptcdn.info/922/041/000/o5vl43d99sVRvnpZsgm-o.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แสดงรายละเอียด",
                payload:"detailChomCholFifth"
              },
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changeChomCholFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}

////image food Baannernnam
function sendImageBaannernnamFirst(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"คอหมูย่าง",
            item_url:"",
            image_url:"https://3.bp.blogspot.com/-AOL0RYCwIFg/Vv8-bEVDvwI/AAAAAAAADCw/bgeu32RDx1UoxImeH-zAU0z5IYz4nAicg/s1600/12670891_953230498124388_7147210296053861375_n.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แสดงรายละเอียด",
                payload:"detailBaannernnamFirst"
              },
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changeBaannernnamFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}
function sendImageBaannernnamSecond(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"ขาหมูทอดกรอบ",
            item_url:"",
            image_url:"http://img.painaidii.com/images/20120930_127_1349021565_291754.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แสดงรายละเอียด",
                payload:"detailBaannernnamSecond"
              },
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changeBaannernnamFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}
function sendImageBaannernnamThird(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"ํเป็ดทรงเครื่อง",
            item_url:"",
            image_url:"https://s3-ap-southeast-1.amazonaws.com/photo.wongnai.com/photos/2014/08/29/a52128d66bb24e7080839cda4f45a36f.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แสดงรายละเอียด",
                payload:"detailBaannernnamThird"
              },
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changeBaannernnamFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}
function sendImageBaannernnamFourth(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"ํํยำปลาหมึก",
            item_url:"",
            image_url:"https://s3-ap-southeast-1.amazonaws.com/photo.wongnai.com/photos/2016/06/11/bfed5f221ced417e9994156960471aaa.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แสดงรายละเอียด",
                payload:"detailBaannernnamFourth"
              },
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changeBaannernnamFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}
function sendImageBaannernnamFifth(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"ํํผัดเผ็ดหมูป่า",
            item_url:"",
            image_url:"http://www.kidtam.com/wp-content/uploads/2016/09/12-3.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แสดงรายละเอียด",
                payload:"detailBaannernnamFifth"
              },
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changeBaannernnamFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}
function sendImageBaannernnamSixth(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"ํํต้มยำกุ้งเล็ก",
            item_url:"",
            image_url:"http://www.doodiza.com/images/1605_1447997622.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แสดงรายละเอียด",
                payload:"detailBaannernnamSixth"
              },
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changeBaannernnamFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}

////image food Robinson
function sendImageRobinsonFirst(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"Topokki",
            item_url:"",
            image_url:"https://s3-ap-southeast-1.amazonaws.com/photo.wongnai.com/photos/2015/09/12/e18408e67b634f9d945f7382b27121a7.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แสดงรายละเอียด",
                payload:"detailRobinsonFirst"
              },
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changeRobinsonFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}
function sendImageRobinsonSecond(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"Wagyu Steak",
            item_url:"",
            image_url:"http://oknation.nationtv.tv/blog/home/user_data/file_data/201301/15/14980c201.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แสดงรายละเอียด",
                payload:"detailRobinsonSecond"
              },
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changeRobinsonFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}
function sendImageRobinsonThird(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"Takoyaki",
            item_url:"",
            image_url:"https://www.yayoirestaurants.com/uploads/image/96BE41CD-F01D-4E9B-85D1-6AB8B84A4C02.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แสดงรายละเอียด",
                payload:"detailRobinsonThird"
              },
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changeRobinsonFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}
function sendImageRobinsonFourth(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"ํHot Pot Buffet",
            item_url:"",
            image_url:"http://2.bp.blogspot.com/-rtL6WPiASvM/Vn6w4mfVHuI/AAAAAAAABlI/6ygYNRreW4Q/s1600/%25E0%25B8%25AA%25E0%25B8%25A1%25E0%25B8%25B1%25E0%25B8%2584%25E0%25B8%25A3%25E0%25B8%2587%25E0%25B8%25B2%25E0%25B8%2599%2BPart%2BTime%2BHOT%2BPOT%2B%25E0%25B8%25AA%25E0%25B8%25B2%25E0%25B8%2582%25E0%25B8%25B2%25E0%25B9%2580%25E0%25B8%258B%25E0%25B9%2587%25E0%25B8%25A5%25E0%25B8%2597%25E0%25B8%25A3%25E0%25B8%25B1%25E0%25B8%25A5%25E0%25B8%259A%25E0%25B8%25B2%25E0%25B8%2587%25E0%25B8%2599%25E0%25B8%25B2%2B45%25E0%25B8%259A%25E0%25B8%25B2%25E0%25B8%2597%25E0%25B8%258A%25E0%25B8%25A1..jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แสดงรายละเอียด",
                payload:"detailRobinsonFourth"
              },
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changeRobinsonFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}
function sendImageRobinsonFifth(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"ํTempura Somen",
            item_url:"",
            image_url:"https://www.yayoirestaurants.com/uploads/image/F5D45267-6E7A-46B2-81D2-81F2F96C1C23.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แสดงรายละเอียด",
                payload:"detailRobinsonFifth"
              },
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changeRobinsonFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}
function sendImageRobinsonSixth(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"ํRamen Champion",
            item_url:"",
            image_url:"https://www.yayoirestaurants.com/uploads/image/8D6E1B28-3E20-4865-86D0-493F1254C795.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แสดงรายละเอียด",
                payload:"detailRobinsonSixth"
              },
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changeRobinsonFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}


////image food Cafe
function sendImageCafeFirst(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"ฮันนี่ โทสต์",
            item_url:"",
            image_url:"http://www.cafekantary.com/images/example/HT_choco_whitebig.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แสดงรายละเอียด",
                payload:"detailCafeFirst"
              },
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changeCafeFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}
function sendImageCafeSecond(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"เบอร์รี่ เบอร์รี่ เครป",
            item_url:"",
            image_url:"http://www.cafekantary.com/images/example/crepe1_B.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แสดงรายละเอียด",
                payload:"detailCafeSecond"
              },
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changeCafeFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}
function sendImageCafeThird(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"คาราเมล วาฟเฟิล",
            item_url:"",
            image_url:"http://www.cafekantary.com/images/example/w2_b.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แสดงรายละเอียด",
                payload:"detailCafeThird"
              },
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changeCafeFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}
function sendImageCafeFourth(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"สตอเบอร์รี่ วาฟเฟิล",
            item_url:"",
            image_url:"http://www.cafekantary.com/images/example/w1_b.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แสดงรายละเอียด",
                payload:"detailCafeFourth"
              },
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changeCafeFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}
function sendImageCafeFifth(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"โอ้ล้า ลา ฮันนี่โทสต์",
            item_url:"",
            image_url:"http://www.cafekantary.com/images/cake-update.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แสดงรายละเอียด",
                payload:"detailCafeFifth"
              },
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changeCafeFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}
function sendImageCafeSixth(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
    message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"ไอศครีมโฮมเมด",
            item_url:"",
            image_url:"http://www.cafekantary.com/images/gelato.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ แสดงรายละเอียด",
                payload:"detailCafeSixth"
              },
              {
                type:"postback",
                title:"🔔 เปลี่ยนเมนูอาหาร",
                payload:"changeCafeFood"
              }]
           }]
      }
      }
    }
  };
callSendAPI(messageData);
}


//เมนูร้านcafe kantary
function menuFoodCafeKantary(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
  message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"ฮันนี่ โทสต์",
            item_url:"",
            image_url:"http://www.cafekantary.com/images/example/HT_choco_whitebig.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ ต้องการทานสิ่งนี้",
                payload:"eatCafeFirst"
              },
              {
                type:"postback",
                title:"🔔 เปลี่ยนสถานที่",
                payload:"changeRestaurant"
              }]
           },
           {
             title:"เบอร์รี่ เบอร์รี่ เครป",
             item_url:"",
             image_url:"http://www.cafekantary.com/images/example/crepe1_B.jpg",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:" ✅ ต้องการทานสิ่งนี้",
                 payload:"eatCafeSecond"
               },
               {
                 type:"postback",
                 title:"🔔 เปลี่ยนสถานที่",
                 payload:"changeRestaurant"
               }]
            },
          {
             title:"ํคาราเมล วาฟเฟิล ",
             item_url:"",
             image_url:"http://www.cafekantary.com/images/example/w2_b.jpg",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:"✅ ต้องการทานสิ่งนี้",
                 payload:"eatCafeThird"
               },
               {
                 type:"postback",
                 title:"🔔 เปลี่ยนสถานที่",
                 payload:"changeRestaurant"
               }]
            },
        {
             title:"ํสตรอเบอร์รี่ วาฟเฟิล",
             item_url:"",
             image_url:"http://www.cafekantary.com/images/example/w1_b.jpg",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:"✅ ต้องการทานสิ่งนี้",
                 payload:"eatCafeFourth"
               },
               {
                 type:"postback",
                 title:"🔔 เปลี่ยนสถานที่",
                 payload:"changeRestaurant"
               }]
            },
        {
             title:"ํโอ้ ล้า ลา ฮันนี่ โทสต์",
             item_url:"",
             image_url:"http://www.cafekantary.com/images/cake-update.jpg",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:"✅ ต้องการทานสิ่งนี้",
                 payload:"eatCafeFifth"
               },
               {
                 type:"postback",
                 title:"🔔 เปลี่ยนสถานที่",
                 payload:"changeRestaurant"
               }]
            },
        {
             title:"ํไอศครีมโฮมเมด",
             item_url:"",
             image_url:"http://www.cafekantary.com/images/gelato.jpg",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:"✅ ต้องการทานสิ่งนี้",
                 payload:"eatCafeSixth"
               },
               {
                 type:"postback",
                 title:"🔔 เปลี่ยนสถานที่",
                 payload:"changeRestaurant"
               }]
        }]
      }
    }
  }
};
callSendAPI(messageData);
} 

//เมนูร้านน่ำเฮียง
function menuFoodNamHiang(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
  message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"กระดูกหมูอ่อนทอดกระเทียมพริกไทย",
            item_url:"",
            image_url:"http://i0.wp.com/s3-ap-southeast-1.amazonaws.com/ungsriwong/wp-content/uploads/2014/05/NumHiang_004.jpg?resize=1024%2C769",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ ต้องการทานสิ่งนี้",
                payload:"eatNamHiangFirst"
              },
              {
                type:"postback",
                title:"🔔 เปลี่ยนสถานที่",
                payload:"changeRestaurant"
              }]
           },
           {
             title:"ผัดผักกระเฉดชลูดน้ำ",
             item_url:"",
             image_url:"http://i2.wp.com/ungsriwong.s3.amazonaws.com/wp-content/uploads/2014/05/NumHiang_005.jpg",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:" ✅ ต้องการทานสิ่งนี้",
                 payload:"eatNamHiangSecond"
               },
               {
                 type:"postback",
                 title:"🔔 เปลี่ยนสถานที่",
                 payload:"changeRestaurant"
               }]
            },
          {
             title:"ํทอดมันกุ้ง ",
             item_url:"",
             image_url:"http://i1.wp.com/ungsriwong.s3.amazonaws.com/wp-content/uploads/2014/05/NumHiang_006.jpg",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:"✅ ต้องการทานสิ่งนี้",
                 payload:"eatNamHiangThird"
               },
               {
                 type:"postback",
                 title:"🔔 เปลี่ยนสถานที่",
                 payload:"changeRestaurant"
               }]
            },
        {
             title:"ํมะระผัดไข่",
             item_url:"",
             image_url:"http://i2.wp.com/ungsriwong.s3.amazonaws.com/wp-content/uploads/2014/05/NumHiang_007.jpg",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:"✅ ต้องการทานสิ่งนี้",
                 payload:"eatNamHiangFourth"
               },
               {
                 type:"postback",
                 title:"🔔 เปลี่ยนสถานที่",
                 payload:"changeRestaurant"
               }]
            },
        {
             title:"ํต้มยำไก่บ้าน",
             item_url:"",
             image_url:"http://i2.wp.com/ungsriwong.s3.amazonaws.com/wp-content/uploads/2014/05/NumHiang_008.jpg",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:"✅ ต้องการทานสิ่งนี้",
                 payload:"eatNamHiangFifth"
               },
               {
                 type:"postback",
                 title:"🔔 เปลี่ยนสถานที่",
                 payload:"changeRestaurant"
               }]
            },
        {
             title:"ํปลาซิวทอดกรอบ",
             item_url:"",
             image_url:"http://i1.wp.com/ungsriwong.s3.amazonaws.com/wp-content/uploads/2014/05/NumHiang_009.jpg",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:"✅ ต้องการทานสิ่งนี้",
                 payload:"eatNamHiangSixth"
               },
               {
                 type:"postback",
                 title:"🔔 เปลี่ยนสถานที่",
                 payload:"changeRestaurant"
               }]
        }]
      }
    }
  }
};
callSendAPI(messageData);
} 

//เมนูร้านปาล์มสวีทโฮม
function menuFoodPalmSweetHome(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
  message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"ไก่มะนาว",
            item_url:"",
            image_url:"http://i1.wp.com/ungsriwong.s3.amazonaws.com/wp-content/uploads/2014/05/PalmSweetHome_003.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ ต้องการทานสิ่งนี้",
                payload:"eatPalmFirst"
              },
              {
                type:"postback",
                title:"🔔 เปลี่ยนสถานที่",
                 payload:"changeRestaurant"
              }]
           },
           {
             title:"ผักบุ้งไฟแดง",
             item_url:"",
             image_url:"http://i2.wp.com/ungsriwong.s3.amazonaws.com/wp-content/uploads/2014/05/PalmSweetHome_001.jpg",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:" ✅ ต้องการทานสิ่งนี้",
                 payload:"eatPalmSecond"
               },
               {
                 type:"postback",
                 title:"🔔 เปลี่ยนสถานที่",
                 payload:"changeRestaurant"
               }]
            },
          {
             title:"ํยำกระเฉดชลูดน้ำ",
             item_url:"",
             image_url:"http://i1.wp.com/ungsriwong.s3.amazonaws.com/wp-content/uploads/2014/05/PalmSweetHome_004.jpg",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:"✅ ต้องการทานสิ่งนี้",
                 payload:"eatPalmThird"
               },
               {
                 type:"postback",
                 title:"🔔 เปลี่ยนสถานที่",
                 payload:"changeRestaurant"
               }]
            },
        {
             title:"ํผัดเผ็ดหมูป่า",
             item_url:"",
             image_url:"http://i2.wp.com/ungsriwong.s3.amazonaws.com/wp-content/uploads/2014/05/PalmSweetHome_007.jpg",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:"✅ ต้องการทานสิ่งนี้",
                 payload:"eatPalmFourth"
               },
               {
                 type:"postback",
                 title:"🔔 เปลี่ยนสถานที่",
                 payload:"changeRestaurant"
               }]
            },
        {
             title:"ํแกงส้มแป๊ะซะ",
             item_url:"",
             image_url:"http://i0.wp.com/ungsriwong.s3.amazonaws.com/wp-content/uploads/2014/05/PalmSweetHome_005.jpg",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:"✅ ต้องการทานสิ่งนี้",
                 payload:"eatPalmFifth"
               },
               {
                 type:"postback",
                 title:"🔔 เปลี่ยนสถานที่",
                 payload:"changeRestaurant"
               }]
            },
        {
             title:"ํผัดเผ็ดปลาช่อน",
             item_url:"",
             image_url:"http://i2.wp.com/ungsriwong.s3.amazonaws.com/wp-content/uploads/2014/05/PalmSweetHome_002.jpg",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:"✅ ต้องการทานสิ่งนี้",
                 payload:"eatPalmSixth"
               },
               {
                 type:"postback",
                 title:"🔔 เปลี่ยนสถานที่",
                 payload:"changeRestaurant"
               }]
        }]
      }
    }
  }
};
callSendAPI(messageData);
} 

//เมนูร้านแอ๊ดข้าวต้ม
function menuFoodAdd(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
  message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"กระเฉดชลูดน้ำไฟแดง",
            item_url:"",
            image_url:"http://i2.wp.com/s3-ap-southeast-1.amazonaws.com/ungsriwong/wp-content/uploads/2014/05/AddKabin_004.jpg?resize=1024%2C768",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ ต้องการทานสิ่งนี้",
                payload:"eatAddFirst"
              },
              {
                type:"postback",
                title:"🔔 เปลี่ยนสถานที่",
                payload:"changeRestaurant"
              }]
           },
           {
             title:"ผักบุ้งไฟแดง",
             item_url:"",
             image_url:"http://i2.wp.com/ungsriwong.s3.amazonaws.com/wp-content/uploads/2014/05/AddKabin_005.jpg",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:" ✅ ต้องการทานสิ่งนี้",
                 payload:"eatAddSecond"
               },
               {
                 type:"postback",
                 title:"🔔 เปลี่ยนสถานที่",
                 payload:"changeRestaurant"
               }]
            },
          {
             title:"ํหมูผัดหนำเลี๊ยบ",
             item_url:"",
             image_url:"http://i0.wp.com/ungsriwong.s3.amazonaws.com/wp-content/uploads/2014/05/AddKabin_007.jpg",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:"✅ ต้องการทานสิ่งนี้",
                 payload:"eatAddThird"
               },
               {
                 type:"postback",
                 title:"🔔 เปลี่ยนสถานที่",
                 payload:"changeRestaurant"
               }]
            },
        {
             title:"ํแกงป่า ปลาเห็ดโคน",
             item_url:"",
             image_url:"http://i2.wp.com/ungsriwong.s3.amazonaws.com/wp-content/uploads/2014/05/AddKabin_008.jpg",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:"✅ ต้องการทานสิ่งนี้",
                 payload:"eatAddFourth"
               },
               {
                 type:"postback",
                 title:"🔔 เปลี่ยนสถานที่",
                 payload:"changeRestaurant"
               }]
            },
        {
             title:"ํเกี้ยมฉ่ายกระเพาะหมู",
             item_url:"",
             image_url:"http://i2.wp.com/ungsriwong.s3.amazonaws.com/wp-content/uploads/2014/05/AddKabin_010.jpg",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:"✅ ต้องการทานสิ่งนี้",
                 payload:"eatAddFifth"
               },
               {
                 type:"postback",
                 title:"🔔 เปลี่ยนสถานที่",
                 payload:"changeRestaurant"
               }]
            },
        {
             title:"ํปลาสลิดทอด",
             item_url:"",
             image_url:"http://i1.wp.com/ungsriwong.s3.amazonaws.com/wp-content/uploads/2014/05/AddKabin_009.jpg",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:"✅ ต้องการทานสิ่งนี้",
                 payload:"eatAddSixth"
               },
               {
                 type:"postback",
                 title:"🔔 เปลี่ยนสถานที่",
                 payload:"changeRestaurant"
               }]
        }]
      }
    }
  }
};
callSendAPI(messageData);
} 


//เมนูร้านชลมล
function menuFoodChomChol(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
  message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"ส้มตำปูม้า",
            item_url:"",
            image_url:"https://s3-ap-southeast-1.amazonaws.com/photo.wongnai.com/photos/2015/01/03/82eeb8edf2404be0b4c96b2d81d809a7.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ ต้องการทานสิ่งนี้",
                payload:"eatChomCholFirst"
              },
              {
                type:"postback",
                title:"🔔 เปลี่ยนสถานที่",
                payload:"changeRestaurant"
              }]
           },
           {
             title:"ลาบปลาช่อนทอด",
             item_url:"",
             image_url:"http://lenoircafe.net/wp-content/uploads/2013/03/%E0%B8%A5%E0%B8%B2%E0%B8%9A%E0%B8%9B%E0%B8%A5%E0%B8%B2%E0%B8%8A%E0%B9%88%E0%B8%AD%E0%B8%993-650.jpg",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:" ✅ ต้องการทานสิ่งนี้",
                 payload:"eatChomCholSecond"
               },
               {
                 type:"postback",
                 title:"🔔 เปลี่ยนสถานที่",
                 payload:"changeRestaurant"
               }]
            },
          {
             title:"ํทอดมันปลากราย",
             item_url:"",
             image_url:"http://archeep.smeleader.com/wp-content/uploads/2014/11/%E0%B8%97%E0%B8%AD%E0%B8%94%E0%B8%A1%E0%B8%B1%E0%B8%99%E0%B8%9B%E0%B8%A5%E0%B8%B2%E0%B8%81%E0%B8%A3%E0%B8%B2%E0%B8%A202-Medium.jpg",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:"✅ ต้องการทานสิ่งนี้",
                 payload:"eatChomCholThird"
               },
               {
                 type:"postback",
                 title:"🔔 เปลี่ยนสถานที่",
                 payload:"changeRestaurant"
               }]
            },
        {
             title:"ํต้มยำกุ้งน้ำข้น ",
             item_url:"",
             image_url:"http://food.mthai.com/app/uploads/2014/04/184615110-1.jpg",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:"✅ ต้องการทานสิ่งนี้",
                 payload:"eatChomCholFourth"
               },
               {
                 type:"postback",
                 title:"🔔 เปลี่ยนสถานที่",
                 payload:"changeRestaurant"
               }]
            },
        {
             title:"ํปลาเนื้ออ่อนทอดกระเทียม",
             item_url:"",
             image_url:"http://f.ptcdn.info/922/041/000/o5vl43d99sVRvnpZsgm-o.jpg",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:"✅ ต้องการทานสิ่งนี้",
                 payload:"eatChomCholFifth"
               },
               {
                 type:"postback",
                 title:"🔔 เปลี่ยนสถานที่",
                 payload:"changeRestaurant"
               }]
            }]
      }
    }
  }
};
callSendAPI(messageData);
} 

//เมนูสวนอาหาร บ้านเนินน้ำ
function menuFoodBaannernnam(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
  message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"คอหมูย่าง",
            item_url:"",
            image_url:"https://3.bp.blogspot.com/-AOL0RYCwIFg/Vv8-bEVDvwI/AAAAAAAADCw/bgeu32RDx1UoxImeH-zAU0z5IYz4nAicg/s1600/12670891_953230498124388_7147210296053861375_n.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ ต้องการทานสิ่งนี้",
                payload:"eatGrilledPork"
              },
              {
                type:"postback",
                title:"🔔 เปลี่ยนสถานที่",
                payload:"changeRestaurant"
              }]
           },
           {
             title:"ขาหมูทอดกรอบ",
             item_url:"",
             image_url:"http://img.painaidii.com/images/20120930_127_1349021565_291754.jpg",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:" ✅ ต้องการทานสิ่งนี้",
                 payload:"eatPigFried"
               },
               {
                 type:"postback",
                 title:"🔔 เปลี่ยนสถานที่",
                 payload:"changeRestaurant"
               }]
            },
          {
             title:"ํเป็ดทรงเครื่อง",
             item_url:"",
             image_url:"https://s3-ap-southeast-1.amazonaws.com/photo.wongnai.com/photos/2014/08/29/a52128d66bb24e7080839cda4f45a36f.jpg",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:"✅ ต้องการทานสิ่งนี้",
                 payload:"eatDuck"
               },
               {
                 type:"postback",
                 title:"🔔 เปลี่ยนสถานที่",
                 payload:"changeRestaurant"
               }]
            },
        {
             title:"ํยำปลาหมึก",
             item_url:"",
             image_url:"https://s3-ap-southeast-1.amazonaws.com/photo.wongnai.com/photos/2016/06/11/bfed5f221ced417e9994156960471aaa.jpg",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:"✅ ต้องการทานสิ่งนี้",
                 payload:"eatSquid"
               },
               {
                 type:"postback",
                 title:"🔔 เปลี่ยนสถานที่",
                 payload:"changeRestaurant"
               }]
            },
        {
             title:"ํผัดเผ็ดหมูป่า",
             item_url:"",
             image_url:"http://www.kidtam.com/wp-content/uploads/2016/09/12-3.jpg",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:"✅ ต้องการทานสิ่งนี้",
                 payload:"eatPigSpicy"
               },
               {
                 type:"postback",
                 title:"🔔 เปลี่ยนสถานที่",
                 payload:"changeRestaurant"
               }]
            },
        {
             title:"ํต้มยำกุ้งเล็ก",
             item_url:"",
             image_url:"http://www.doodiza.com/images/1605_1447997622.jpg",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:"✅ ต้องการทานสิ่งนี้",
                 payload:"eatTomyumkung"
               },
               {
                 type:"postback",
                 title:"🔔 เปลี่ยนสถานที่",
                 payload:"changeRestaurant"
               }]
            }]
      }
    }
  }
};
callSendAPI(messageData);
} 

//เมนูโรบินสัน
function menuFoodRobinson(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
  message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"Topokki",
            item_url:"",
            image_url:"https://s3-ap-southeast-1.amazonaws.com/photo.wongnai.com/photos/2015/09/12/e18408e67b634f9d945f7382b27121a7.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ ต้องการทานสิ่งนี้",
                payload:"eatSalang"
              },
              {
                type:"postback",
                title:"🔔 เปลี่ยนสถานที่",
                payload:"changeRestaurant"
              }]
           },
           {
             title:"Wagyu Steak",
             item_url:"",
             image_url:"http://oknation.nationtv.tv/blog/home/user_data/file_data/201301/15/14980c201.jpg",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:" ✅ ต้องการทานสิ่งนี้",
                 payload:"eatJefferSteak"
               },
               {
                 type:"postback",
                 title:"🔔 เปลี่ยนสถานที่",
                 payload:"changeRestaurant"
               }]
            },
          {
             title:"ํTakoyaki",
             item_url:"",
             image_url:"https://www.yayoirestaurants.com/uploads/image/96BE41CD-F01D-4E9B-85D1-6AB8B84A4C02.jpg",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:"✅ ต้องการทานสิ่งนี้",
                 payload:"eatYayoi"
               },
               {
                 type:"postback",
                 title:"🔔 เปลี่ยนสถานที่",
                 payload:"changeRestaurant"
               }]
            },
        {
             title:"ํHot Pot Buffet",
             item_url:"",
             image_url:"http://2.bp.blogspot.com/-rtL6WPiASvM/Vn6w4mfVHuI/AAAAAAAABlI/6ygYNRreW4Q/s1600/%25E0%25B8%25AA%25E0%25B8%25A1%25E0%25B8%25B1%25E0%25B8%2584%25E0%25B8%25A3%25E0%25B8%2587%25E0%25B8%25B2%25E0%25B8%2599%2BPart%2BTime%2BHOT%2BPOT%2B%25E0%25B8%25AA%25E0%25B8%25B2%25E0%25B8%2582%25E0%25B8%25B2%25E0%25B9%2580%25E0%25B8%258B%25E0%25B9%2587%25E0%25B8%25A5%25E0%25B8%2597%25E0%25B8%25A3%25E0%25B8%25B1%25E0%25B8%25A5%25E0%25B8%259A%25E0%25B8%25B2%25E0%25B8%2587%25E0%25B8%2599%25E0%25B8%25B2%2B45%25E0%25B8%259A%25E0%25B8%25B2%25E0%25B8%2597%25E0%25B8%258A%25E0%25B8%25A1..jpg",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:"✅ ต้องการทานสิ่งนี้",
                 payload:"eatHotPot"
               },
               {
                 type:"postback",
                 title:"🔔 เปลี่ยนสถานที่",
                 payload:"changeRestaurant"
               }]
            },
        {
             title:"ํTempura Somen",
             item_url:"",
             image_url:"https://www.yayoirestaurants.com/uploads/image/F5D45267-6E7A-46B2-81D2-81F2F96C1C23.jpg",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:"✅ ต้องการทานสิ่งนี้",
                 payload:"eatTempura"
               },
               {
                 type:"postback",
                 title:"🔔 เปลี่ยนสถานที่",
                 payload:"changeRestaurant"
               }]
            },
        {
             title:"ํRamen Champion",
             item_url:"",
             image_url:"https://www.yayoirestaurants.com/uploads/image/8D6E1B28-3E20-4865-86D0-493F1254C795.jpg",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:"✅ ต้องการทานสิ่งนี้",
                 payload:"eatRamenChampion"
               },
               {
                 type:"postback",
                 title:"🔔 เปลี่ยนสถานที่",
                 payload:"changeRestaurant"
               }]
            }]
      }
    }
  }
};
callSendAPI(messageData);
} 

//ต้องการให้คุณช่วย
function needYourHelp(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text : "หากคุณต้องการมองหาร้านอาหารในปราจีนบุรีอีก เพียงแค่ให้ผมช่วย",
            buttons: [{
              type: "postback",
              title: "⚡️ ต้องการให้ผมช่วย",
              payload: "I_need_your_help"
            }]
        }
      }
    }
  };
  callSendAPI(messageData);
}
function needYourHelpEnd(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text : "หากคุณต้องการมองหาร้านอาหารในปราจีนบุรีอีก เพียงแค่ให้ผมช่วย",
            buttons: [{
              type: "postback",
              title: "🍣 ค้นหาร้านอาหาร",
              payload: "findRestaurant"
            },
            {
              type: "postback",
              title: "❌ ไม่เป็นไร ขอบคุณ",
              payload: "noThank"
            }]
        }
      }
    }
  };
  callSendAPI(messageData);
}
function needYourHelpDefault(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text : "¯\_(ツ)_/¯ มีอะไรให้ช่วยมั้ย!",
            buttons: [{
              type: "postback",
              title: "🍣 ค้นหาร้านอาหาร",
              payload: "findRestaurant"
            },
            {
              type: "postback",
              title: "❌ ไม่เป็นไร ขอบคุณ",
              payload: "noThank"
            }]
        }
      }
    }
  };
  callSendAPI(messageData);
}

function sendGreetMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text : "นี้คือคู่มือร้านอาหารของคุณในปราจีนบุรี ผมจะช่วยคุณได้อย่างไร",
            buttons: [{
              type: "postback",
              title: "🍣 ค้นหาร้านอาหาร",
              payload: "findRestaurant"
            }, {
              type: "postback",
              title: "❌ ไม่เป็นไร ขอบคุณ",
              payload: "noThank"
            }]
        }
      }
    }
  };  

  callSendAPI(messageData);
}

function findRestaurants(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
  message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"โรบินสัน ปราจีนบุรี",
            item_url:"",
            image_url:"http://www.robinson.co.th/images/201412/gallery2/1-1.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ เลือกที่นี้",
                payload:"robinson"
              },
              {
                type:"postback",
                title:"❌ ไม่เป็นไร ขอบคุณ",
                payload:"noThank"
              }]
           },
           {
             title:"Cafe Kantary",
             item_url:"",
             image_url:"http://www.cafekantary.com/images/gallery/pra3.jpg",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:" ✅เลือกที่นี้",
                 payload:"CafeKantary"
               },
               {
                 type:"postback",
                 title:"❌ ไม่เป็นไร ขอบคุณ",
                 payload:"noThank"
               }]
            },
        {
             title:"สวนอาหาร บ้านเนินน้ำ",
             item_url:"",
             image_url:"https://s3-ap-southeast-1.amazonaws.com/photo.wongnai.com/photos/2015/06/01/768c556759d446499cd21aa9896957f8.jpg?v=2",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:"✅ เลือกที่นี้",
                 payload:"baannernnam"
               },
               {
                 type:"postback",
                 title:"❌ ไม่เป็นไร ขอบคุณ",
                 payload:"noThank"
               }]
            },
        {
             title:"ร้านอาหารชมชล",
             item_url:"",
             image_url:"https://s3-ap-southeast-1.amazonaws.com/photo.wongnai.com/photos/2012/10/07/0e81bf6ad4ef4f2ea4361c7985c027df.jpg",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:"✅ เลือกที่นี้",
                 payload:"ChomChol"
               },
               {
                 type:"postback",
                 title:"❌ ไม่เป็นไร ขอบคุณ",
                 payload:"noThank"
               }]
            },
        {
             title:"น่ำเฮียงโภชนา (ฟ้ามุ่ย)",
             item_url:"",
             image_url:"http://i0.wp.com/ungsriwong.s3.amazonaws.com/wp-content/uploads/2014/05/NumHiang_010.jpg",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:"✅ เลือกที่นี้",
                 payload:"NamHiang"
               },
               {
                 type:"postback",
                 title:"❌ ไม่เป็นไร ขอบคุณ",
                 payload:"noThank"
               }]
            },
        {
             title:"แอ๊ด ข้าวต้ม กบินทร์บุรี",
             item_url:"",
             image_url:"http://i1.wp.com/ungsriwong.s3.amazonaws.com/wp-content/uploads/2014/05/AddKabin_012.jpg",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:"✅ เลือกที่นี้",
                 payload:"Add"
               },
               {
                 type:"postback",
                 title:"❌ ไม่เป็นไร ขอบคุณ",
                 payload:"noThank"
               }]
            },
        {
             title:"ร้านอาหาร ปาล์มสวีทโฮม กบินทร์บุรี",
             item_url:"",
             image_url:"http://image.free.in.th/v/2013/iq/161118060914.png",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:"✅ เลือกที่นี้",
                 payload:"PalmSweetHome"
               },
               {
                 type:"postback",
                 title:"❌ ไม่เป็นไร ขอบคุณ",
                 payload:"noThank"
               }]
            }]
      }
    }
  }
};
callSendAPI(messageData);
} 

function sendTextMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText
    }
  };

  callSendAPI(messageData);
}

function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: 'EAANZAja8Q2n0BAMB7hyWYwKkL84couhF6WrHeWI2LaDl9WIZB0NFhgZCZAC2eWQYOgusV3LsVt27cNYwgZATE7I08g8dWYnBuf5mk4CgETQFlCBubaeOiVYUq8SgUZA5fz91bSgKWc93WDWGu1dTZBe2MDk4xZBKKJtZCkS6BLZBs4lQZDZD' },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      console.log("Successfully sent generic message with id %s to recipient %s", 
        messageId, recipientId);
    } else {
      console.error("Unable to send message.");
      console.error(response);
      console.error(error);
    }
  });  
}

/*function sendQuickReply(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: "What's your favorite movie genre?",
      quick_replies: [
        {
          "content_type":"text",
          "title":"Action",
          "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_ACTION"
        },
        {
          "content_type":"text",
          "title":"Comedy",
          "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_COMEDY"
        },
        {
          "content_type":"text",
          "title":"Drama",
          "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_DRAMA"
        }
      ]
    }
  };
  callSendAPI(messageData);
}*/

app.listen(app.get('port'), function () {
  console.log('run at port', app.get('port'))
})
