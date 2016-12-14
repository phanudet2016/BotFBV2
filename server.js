var express = require('express')
var bodyParser = require('body-parser')
var request = require('request')
var app = express()
var data = require('./Data.json')


app.use(bodyParser.json())
app.set('port', (process.env.PORT || 4000))
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.get('/webhook', function(req, res) {
  var key = 'EAAED8JoP8T8BAMweGCz05n2xCGzw6k8ZBP3JKZCskZBxZCbYOUzOXNkZCZCZChZAF2QDXalqVg3c0OjtH4i4bTux0jAAMqUQt0Bmoy7c72eR2poIZAUwfrXXN4whWszZAkIL8ihBlFoRRXOMEpT3I6NU7HXHtvH65jJRqaTo70EsdvgQZDZD'
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
  
  if (data.object == 'page') {
    data.entry.forEach(function(pageEntry) {
      var pageID = pageEntry.id;
      var timeOfEvent = pageEntry.time;
      
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
 
  var messageText = message.text;
  var messageAttachments = message.attachments;
  var quickReply = message.quick_reply;

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
        findRestaurants(senderID);sendGenericMessage
      }, 1500)
    }else {}

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
 else if(payload){
   ///////////////////// Click เลือกที่นี้ //////////////////////////////////////
   for(var i = 0; i < data.bigdata.length; i++) {
            var obj = data.bigdata[i];
            if(payload==obj.restaurant){
              sendTextMessage(senderID, obj.text);
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
   }//end for
   
   ///////////////////// Click ต้องการทานสิ่งนี้ //////////////////////////////////////
   setTimeout(function() {
     for(var i = 0; i < data.bigdata.length; i++) {
       var obj = data.bigdata[i];
       if(payload==obj.eat){sendTextMessage(senderID, obj.text);}
     }//end for
   }, 500)
   setTimeout(function() {
    for(var i = 0; i < data.bigdata.length; i++) {
      var obj = data.bigdata[i];
      if(payload==obj.eat){sendTextMessage(senderID, obj.text1);}
    }
   }, 1000)
    setTimeout(function() {
      //Cafe
      if(payload == 'eatCafeFirst'){sendImageCafeFirst(senderID);}
      else if(payload == 'eatCafeSecond'){sendImageCafeSecond(senderID);}
      else if(payload == 'eatCafeThird'){sendImageCafeThird(senderID);}
      else if(payload == 'eatCafeFourth'){sendImageCafeFourth(senderID);}
      else if(payload == 'eatCafeFifth'){sendImageCafeFifth(senderID);}
      else if(payload == 'eatCafeSixth'){sendImageCafeSixth(senderID);}
      //Robinson
      else if(payload == 'eatSalang'){sendImageRobinsonFirst(senderID);}
      else if(payload == 'eatJefferSteak'){sendImageRobinsonSecond(senderID);}
      else if(payload == 'eatYayoi'){sendImageRobinsonThird(senderID);}
      else if(payload == 'eatHotPot'){sendImageRobinsonFourth(senderID);}
      else if(payload == 'eatTempura'){sendImageRobinsonFifth(senderID);}
      else if(payload == 'eatRamenChampion'){sendImageRobinsonSixth(senderID);}
      //บ้านเนินน้ำ
      else if(payload == 'eatGrilledPork'){sendImageBaannernnamFirst(senderID);}
      else if(payload == 'eatPigFried'){sendImageBaannernnamSecond(senderID);}
      else if(payload == 'eatDuck'){sendImageBaannernnamThird(senderID);}
      else if(payload == 'eatSquid'){sendImageBaannernnamFourth(senderID);}
      else if(payload == 'eatPigSpicy'){sendImageBaannernnamFifth(senderID);}
      else if(payload == 'eatTomyumkung'){sendImageBaannernnamSixth(senderID);}
      //ร้านชลชล
      else if(payload == 'eatChomCholFirst'){sendImageChomCholFirst(senderID);}
      else if(payload == 'eatChomCholSecond'){sendImageChomCholSecond(senderID);}
      else if(payload == 'eatChomCholThird'){sendImageChomCholThird(senderID);}
      else if(payload == 'eatChomCholFourth'){sendImageChomCholFourth(senderID);}
      else if(payload == 'eatChomCholFifth'){sendImageChomCholFifth(senderID);}
      //น่ำเฮียง โภชนา
      else if(payload == 'eatNamHiangFirst'){sendImageNamHiangFirst(senderID);}
      else if(payload == 'eatNamHiangSecond'){sendImageNamHiangSecond(senderID);}
      else if(payload == 'eatNamHiangThird'){sendImageNamHiangThird(senderID);}
      else if(payload == 'eatNamHiangFourth'){sendImageNamHiangFourth(senderID);}
      else if(payload == 'eatNamHiangFifth'){sendImageNamHiangFifth(senderID);}
      else if(payload == 'eatNamHiangSixth'){sendImageNamHiangSixth(senderID);}
      //แอ๊ดข้าวต้ม
      else if(payload == 'eatAddFirst'){sendImageAddFirst(senderID);}
      else if(payload == 'eatAddSecond'){sendImageAddSecond(senderID);}
      else if(payload == 'eatAddThird'){sendImageAddThird(senderID);}
      else if(payload == 'eatAddFourth'){sendImageAddFourth(senderID);}
      else if(payload == 'eatAddFifth'){sendImageAddFifth(senderID);}
      else if(payload == 'eatAddSixth'){sendImageAddSixth(senderID);}
      //ปาล์มสวีทโฮม
      else if(payload == 'eatPalmFirst'){sendImagePalmFirst(senderID);}
      else if(payload == 'eatPalmSecond'){sendImagePalmSecond(senderID);}
      else if(payload == 'eatPalmThird'){sendImagePalmThird(senderID);}
      else if(payload == 'eatPalmFourth'){sendImagePalmFourth(senderID);}
      else if(payload == 'eatPalmFifth'){sendImagePalmFifth(senderID);}
      else if(payload == 'eatPalmSixth'){sendImagePalmSixth(senderID);}
      else{var result = "";}
    }, 1200)
    setTimeout(function() {
    for(var i = 0; i < data.bigdata.length; i++) {
      var obj = data.bigdata[i];
      if(payload==obj.eat){sendTextMessage(senderID, obj.price);}
    }
   }, 2000)
    setTimeout(function() {
    for(var i = 0; i < data.bigdata.length; i++) {
      var obj = data.bigdata[i];
      if(payload==obj.eat){sendTextMessage(senderID, obj.open);}
    }
   }, 2500)
    setTimeout(function() {
    for(var i = 0; i < data.bigdata.length; i++) {
      var obj = data.bigdata[i];
      if(payload==obj.eat){sendTextMessage(senderID, obj.holiday);}
    }
   }, 3000)
   
   /////////ต้องการเปลี่ยนเมนูอาหาร/////////////
   if(payload=='changePalmFood'){menuFoodPalmSweetHome(senderID);}
   else if(payload=='changeAddFood'){menuFoodAdd(senderID);}
   else if(payload=='changeCafeFood'){menuFoodCafeKantary(senderID);}
   else if(payload=='changeRobinsonFood'){menuFoodRobinson(senderID);}
   else if(payload=='changeBaannernnamFood'){menuFoodBaannernnam(senderID);}
   else if(payload=='changeChomCholFood'){menuFoodChomChol(senderID);}
   else if(payload=='changeNamHiangFood'){menuFoodNamHiang(senderID);}
   ////////////////////////////////////////
   
   ///////// Click แสดงรายละเอียด ///////////
   setTimeout(function() {
     for(var i = 0; i < data.bigdata.length; i++) {
       var obj = data.bigdata[i];
       if(payload==obj.detailMapPalm){mapReviewPalm(senderID);}
       if(payload==obj.detailMapNamHiang){mapReviewNamHiang(senderID);}
       if(payload==obj.detailMapAdd){mapReviewAdd(senderID);}
       if(payload==obj.detailMapChomChol){mapReviewChomChol(senderID);}
       if(payload==obj.detailMapBaannernnam){mapReviewBaannernnam(senderID);}
       if(payload==obj.detailMapCafe){mapReviewCafe(senderID);}
       if(payload==obj.detailMapRobinson){
         if(payload == 'detailRobinsonFirst'){mapReviewSalang(senderID);}
         if(payload == 'detailRobinsonSecond'){mapReviewJefferSteak(senderID);}
         if(payload == 'detailRobinsonThird'){mapReviewYayoi(senderID);}
         if(payload == 'detailRobinsonFourth'){mapReviewHotPot(senderID);}
         if(payload == 'detailRobinsonFifth'){mapReviewYayoi(senderID);}
         if(payload == 'detailRobinsonSixth'){mapReviewRamenChampion(senderID);} 
       }
     }//end for
   }, 500)
   setTimeout(function() {
     for(var i = 0; i < data.bigdata.length; i++) {
       var obj = data.bigdata[i];
       if(payload==obj.detailMapPalm){sendTextMessage(senderID, obj.text);}
       if(payload==obj.detailMapNamHiang){sendTextMessage(senderID, obj.text);}
       if(payload==obj.detailMapAdd){sendTextMessage(senderID, obj.text);}
       if(payload==obj.detailMapChomChol){sendTextMessage(senderID, obj.text);}
       if(payload==obj.detailMapBaannernnam){sendTextMessage(senderID, obj.text);}
       if(payload==obj.detailMapCafe){sendTextMessage(senderID, obj.text);}
       if(payload==obj.detailMapRobinson){sendTextMessage(senderID, obj.text);}
     }//end for
   }, 1000)
    setTimeout(function() {
     for(var i = 0; i < data.bigdata.length; i++) {
       var obj = data.bigdata[i];
       if(payload==obj.detailMapPalm){
          if(payload == 'detailPalmFirst'){detailPalmFirst(senderID);}
          if(payload == 'detailPalmSecond'){detailPalmSecond(senderID);}
          if(payload == 'detailPalmThird'){detailPalmThird(senderID);}
          if(payload == 'detailPalmFourth'){detailPalmFourth(senderID);}
          if(payload == 'detailPalmFifth'){detailPalmFifth(senderID);}
          if(payload == 'detailPalmSixth'){detailPalmSixth(senderID);}
       }
       if(payload==obj.detailMapNamHiang){
         if(payload == 'detailNamHiangFirst'){detailNamHiangFirst(senderID);}
         if(payload == 'detailNamHiangSecond'){detailNamHiangSecond(senderID);}
         if(payload == 'detailNamHiangThird'){detailNamHiangThird(senderID);}
         if(payload == 'detailNamHiangFourth'){detailNamHiangFourth(senderID);}
         if(payload == 'detailNamHiangFifth'){detailNamHiangFifth(senderID);}
         if(payload == 'detailNamHiangSixth'){detailNamHiangSixth(senderID);}
       }
       if(payload==obj.detailMapAdd){
         if(payload == 'detailAddFirst'){detailAddFirst(senderID);}
         if(payload == 'detailAddSecond'){detailAddSecond(senderID);}
         if(payload == 'detailAddThird'){detailAddThird(senderID);}
         if(payload == 'detailAddFourth'){detailAddFourth(senderID);}
         if(payload == 'detailAddFifth'){detailAddFifth(senderID);}
         if(payload == 'detailAddSixth'){detailAddSixth(senderID);}
       }
       if(payload==obj.detailMapChomChol){
         if(payload == 'detailChomCholFirst'){detailChomCholFirst(senderID);}
         if(payload == 'detailChomCholSecond'){detailChomCholSecond(senderID);}
         if(payload == 'detailChomCholThird'){detailChomCholThird(senderID);}
         if(payload == 'detailChomCholFourth'){detailChomCholFourth(senderID);}
         if(payload == 'detailChomCholFifth'){detailChomCholFifth(senderID);}
       }
       if(payload==obj.detailMapBaannernnam){
         if(payload == 'detailBaannernnamFirst'){detailBaannernnamFirst(senderID);}
         if(payload == 'detailBaannernnamSecond'){detailBaannernnamSecond(senderID);}
         if(payload == 'detailBaannernnamThird'){detailBaannernnamThird(senderID);}
         if(payload == 'detailBaannernnamFourth'){detailBaannernnamFourth(senderID);}
         if(payload == 'detailBaannernnamFifth'){detailBaannernnamFifth(senderID);}
         if(payload == 'detailBaannernnamSixth'){detailBaannernnamSixth(senderID);}
       }
       if(payload==obj.detailMapCafe){
         if(payload == 'detailCafeFirst'){detailCafeFirst(senderID);}
         if(payload == 'detailCafeSecond'){detailCafeSecond(senderID);}
         if(payload == 'detailCafeThird'){detailCafeThird(senderID);}
         if(payload == 'detailCafeFourth'){detailCafeFourth(senderID);}
         if(payload == 'detailCafeFifth'){detailCafeFifth(senderID);}
         if(payload == 'detailCafeSixth'){detailCafeSixth(senderID);}
       }
       if(payload==obj.detailMapRobinson){
         if(payload == 'detailRobinsonFirst'){detailRobinsonFirst(senderID);}
         if(payload == 'detailRobinsonSecond'){detailRobinsonSecond(senderID);}
         if(payload == 'detailRobinsonThird'){detailRobinsonThird(senderID);}
         if(payload == 'detailRobinsonFourth'){detailRobinsonFourth(senderID);}
         if(payload == 'detailRobinsonFifth'){detailRobinsonFifth(senderID);}
         if(payload == 'detailRobinsonSixth'){detailRobinsonSixth(senderID);}   
       }
     }//end for
   }, 1500)
   /////////////////////////////////////////////////////////////////
   
    ///////// Click ไปร้านนี้แน่นอน //////
   setTimeout(function() {
     for(var i = 0; i < data.bigdata.length; i++) {
       var obj = data.bigdata[i];
       if(payload==obj.sure){
         sendTextMessage(senderID, obj.text);
         setTimeout(function() {
           needYourHelpEnd(senderID);
         }, 1000)
       }
     }
   }, 500)
   /////////////////////////////////////////////////////////////////
  }//end else if
  
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
    qs: { access_token: 'EAAED8JoP8T8BAMweGCz05n2xCGzw6k8ZBP3JKZCskZBxZCbYOUzOXNkZCZCZChZAF2QDXalqVg3c0OjtH4i4bTux0jAAMqUQt0Bmoy7c72eR2poIZAUwfrXXN4whWszZAkIL8ihBlFoRRXOMEpT3I6NU7HXHtvH65jJRqaTo70EsdvgQZDZD' },
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

app.listen(app.get('port'), function () {
  console.log('run at port', app.get('port'))
})
