var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var apiai = require('apiai');
var Regex = require('regex');
mongoose.Promise = require('bluebird');
var request = require('request');
var dotenv = require('dotenv');
var api = require('./api.js');
var User = require('../models/user.js');
var Bot = require('../models/bot.js');
var QuickReply = require('../models/quick_reply.js');
var UserPersonal = require('../models/user_personal.js');
var ReplyWithText = require('../models/reply_with_text.js');
var ReplyWithAttachments = require('../models/reply_with_attachments.js');
var QuickReplyText = require('../models/quick_reply_text.js');
var ReplyWithUrl = require('../models/reply_with_url.js');
var PlainText = require('../models/reply_with_plain_text.js');
var ReplyWithUrlOnly = require('../models/reply_with_url_only.js');
var ReplyWithImageOnly = require('../models/reply_with_image_only.js');
var WebhookHistory = require('../models/webhook_history.js');
var functionController = require('./functionController.js');
var BmrCalculateModule = require('./bmr-calculate-module-controller.js');
var DietPlanModule = require('./diet-plan-module-controller.js');
var GameModule = require('./game-module-controller.js');
var PortionGuidanceModule = require('./portion-guidance-module-controller.js');
var _ = require('underscore');
var textMsg;
var userName;
var noOfUser;
var checkData;
var user;
var image_url = [];
var title = [];
var payload = [];
var payload1 = [];
var button_title = [];
var button_web_title = [];
var button_web_url = [];
var subtitle = [];
var replyMessageWithAttachments;
dotenv.load();
//console.log(process.env.API_AI_CLIENT);
var apiapp = apiai(process.env.API_AI_CLIENT);
var db = process.env.DB_URL;
console.log(db);
mongoose.connect(db);
module.exports = function(app) {
  app.use(bodyParser.urlencoded({
    extended: false
  }))

  // parse application/json
  app.use(bodyParser.json());
  //To check application is started
  app.get("/", function(req, res) {
    res.send("Deployed!");
    console.log("deployed");
  });
  //Verify facebook token request
  app.get('/webhook', function(req, res) {
    if (req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] == process.env.HUB_VERIFY) {
      console.log("Validating webhook");
      res.status(200).send(req.query['hub.challenge']);
    } else {
      console.error("Failed validation. Make sure the validation tokens match.");
      res.sendStatus(403);
    }
  });
//Handle
  app.post('/webhook', function(req, res) {
    var data = req.body;

    // Make sure this is a page subscription
    if (data.object === 'page') {

      // Iterate over each entry - there may be multiple if batched
      data.entry.forEach(function(entry) {
        //page ID used by the Data comes from Facebook
        var pageID = entry.id;
        //timeEvent of Data used from facebook
        var timeOfEvent = entry.time;

        // Iterate over each messaging event
        entry.messaging.forEach(function(event) {

           if (event.postback) { //message is postback type
             if(event.postback.payload==="GET_STARTED_PAYLOAD")
             {
               payload[0]="ANGRY";
               title[0]="Angry";
               payload[1]="SAD";
               title[1]="Sad";
               payload[2]="BROKEN";
               title[2]="Broken";
               payload[3]="DEPRESSED";
               title[3]="Depressed";
               textMsg=process.env.FEELING;
               functionController.quickReply(event.sender.id, payload, title, textMsg);
             }
             if(event.postback.payload==="START_BOT")
             {
               User.findOne({user_id:event.sender.id}).exec(function(err,data){
                 if(!err)
                 {
                   title[0] = process.env.TITLE;
                   payload[0] = process.env.PAYLOAD_TITLE;
                   console.log("name",data);
                   textMsg = "Hi " + data.name + ", get fit with Nestle, your companion to good health.";
                   //receivedMessage(event, textMsg);title,payload
                   functionController.replyWithPlainText(event.sender.id, textMsg);
                   textMsg1 = process.env.TEXT_MSG;
                   functionController.receivedMessage(event.sender.id, title, payload, textMsg1);

                 }
                 else {
                   console.log("error in user retrieval");
                 }

               })

             }
            if(event.postback.payload==="NOT_IN_MOOD_TO_PLAY_GAME")
            {
              functionController.replyWithPlainText(event.sender.id,process.env.TEXT_START);
            }
            if (event.postback.payload === "PALM") {
              PortionGuidanceModule.portionGuidanceModulePostback(event.sender.id, event.postback.payload);
            }
            if (event.postback.payload === "DAL") {
              PortionGuidanceModule.portionGuidanceModulePostback(event.sender.id, event.postback.payload);

            }
            if (event.postback.payload === "CREDIT_CARD") {
              PortionGuidanceModule.portionGuidanceModulePostback(event.sender.id, event.postback.payload);
            }
            if (event.postback.payload === "CD")
              PortionGuidanceModule.portionGuidanceModulePostback(event.sender.id, event.postback.payload); {}
            if (event.postback.payload === "TENNIS_BALL") {
              PortionGuidanceModule.portionGuidanceModulePostback(event.sender.id, event.postback.payload);
            }
            if (event.postback.payload === "LET_GO_PORTION") {
              PortionGuidanceModule.portionGuidanceModulePostback(event.sender.id, event.postback.payload);
            }
            if (event.postback.payload === "START_GAME") {
              GameModule.gameModulePostback(event.sender.id, event.postback.payload);
            }
            if (event.postback.payload === "PLAY_GAME") {
              GameModule.gameModulePostback(event.sender.id, event.postback.payload);
            }
            if (event.postback.payload === "CALORIE_CALCULATOR") {
              console.log("calorie calculator");
              functionController.callCalorieCalculator(event.sender.id);
            }
            if (event.postback.payload === "GOT_IT") {
              ReplyWithAttachments.find({
                payload_for: "GOT_IT"
              }).exec(function(err, result) {

                functionController.callReplyWithAttachments(result, err, event.sender.id);
              });

            }
            if (event.postback.payload === "GOT_IT_RUNNING_STATUS") {

              BmrCalculateModule.postback(event.sender.id, event.postback.payload);
            }
            if (event.postback.payload === "EDIT_USER_DETAIL") {

              BmrCalculateModule.postback(event.sender.id, event.postback.payload);
            }
            if (event.postback.payload === "VERY_ACTIVE_EXERCISE" || event.postback.payload === "MODERATE_EXERCISE" || event.postback.payload === "LIGHTLY_EXERCISE" || event.postback.payload === "SEDENTRY_EXERCISE") {
              BmrCalculateModule.postback(event.sender.id, event.postback.payload);
            }
            if (event.postback.payload === "PORTION_GUIDANCE") {
              PortionGuidanceModule.portionGuidanceModulePostback(event.sender.id, event.postback.payload);
            }
            //payload is reading manual
            if (event.postback.payload === "READING_MANUAL") {
             //find title and payload whose payload_for is reading_manual
              PlainText.find({
                payload_for: "READING_MANUAL"
              }).exec(function(err, data) {
                if (!err) {
                  console.log("text for portion guidance:", data[0].text);
                  ReplyWithText.find({
                    payload_for: "READING_MANUAL"
                  }).exec(function(err, result) {
                    if (!err) {
                      for (i = 0; i < _.size(result); i++) {
                        title[i] = result[i].title;
                        payload[i] = result[i].payload;
                      }
                      console.log("result:", result);
                      functionController.replyWithTwoPayload(event.sender.id, title, payload, data[0].text);
                    } else {

                    }
                  });
                } else {
                  console.log("error in plain text model");
                }
              });
            }
            //ask question
            if(event.postback.payload==="QUERY")
            {
              textMsg="How can we help you?";
              functionController.replyWithPlainText(event.sender.id,textMsg);
            }
            //payload is go ahead type
            if (event.postback.payload === "GO_AHEAD") {
              //find attachment detail where payload_for is go ahead
              ReplyWithAttachments.find({
                payload_for: "GO_AHEAD"
              }).exec(function(err, result) {
                 //call reply with attachment method
                functionController.callReplyWithAttachments(result, err, event.sender.id);
              });
            }
            //payload is learn more type
            if (event.postback.payload === "LEARN_MORE") {
             //find text where payload_for is learn more
              PlainText.find({
                payload_for: "LEARN_MORE"
              }).exec(function(err, data) {
                if (!err) {
                  console.log("text for portion guidance:", data[0].text);
                 //find title and payload where payload_for is learn more
                  ReplyWithText.find({
                    payload_for: "LEARN_MORE"
                  }).exec(function(err, result) {
                    if (!err) {
                      for (i = 0; i < _.size(result); i++) {
                        title[i] = result[i].title;
                        payload[i] = result[i].payload;
                      }
                      console.log("result:", result);
                     //reply to user with two payload message
                      functionController.replyWithTwoPayload(event.sender.id, title, payload, data[0].text);
                    } else {

                    }
                  });
                } else {
                  console.log("error in plain text model");
                }
              });
            }
            if (event.postback.payload === "USER_DETAIL_CONFIRM") {
              //console.log("user detail confirm");
              BmrCalculateModule.postback(event.sender.id, event.postback.payload);

              //functionController.replyWithAttachments(event.sender.id, image_url, title, payload, button_title);
            }
            if (event.postback.payload === "SHOWED_CALORIE") {
              DietPlanModule.postback(event.sender.id, event.postback.payload);
            }
            if (event.postback.payload === "DIET_QUERIES") {
              text = process.env.DIET_QUERIES;
              functionController.replyWithPlainText(event.sender.id, text);
            }
            if (event.postback.payload === "MAKE_DIET_PLAN") {
              DietPlanModule.postback(event.sender.id, event.postback.payload);

            }
            if (event.postback.payload === "GET_STARTED") {
            //find title and payload where payload_for is get started
              QuickReply.find({
                payload_for: "GET_STARTED"
              }).exec(function(err, result) {
                if (!err) {
                  //  console.log("quick reply result:",result);
                  for (var i = 0; i < _.size(result); i++) {
                    title[i] = result[i].title;
                    payload[i] = result[i].payload;
                  }
                  //find text where payload is get started
                  QuickReplyText.find({
                    payload_for: "GET_STARTED"
                  }).exec(function(err, result) {
                    if (!err) {
                      //console.log("quick reply with text:",result[0]);
                      functionController.quickReply(event.sender.id, title, payload, result[0].text);
                    } else {
                      console.log("error in quick reply with text");
                    }
                  });
                } else {
                  console.log("error in quick reply data fetching.");
                }
              })
            }
          }
          else if (event.message && event.message.attachments) { //message is attachment type
            console.log("message with attachments");




          } else if (event.message && event.message.text) {
            // message is quick reply type
            if (event.message.quick_reply) {
              if (event.message.quick_reply.payload === "REMINDER_OFF" || event.message.quick_reply.payload === "I_AM_IN") {
                DietPlanModule.quickReplyPostback(event.sender.id, event.message.quick_reply.payload);
              }
              if (event.message.quick_reply.payload === "NOT_DECIDED" || event.message.quick_reply.payload === "BEGINNER" || event.message.quick_reply.payload === "HALF_MARATHON" || event.message.quick_reply.payload === "FULL_MARATHON") {
                //quickReply(event.sender.id);
                //functionController.quickReply(event.sender.id);
                BmrCalculateModule.quickReplyPostback(event.sender.id, event.message.quick_reply.payload);
              }

              if (event.message.quick_reply.payload === "VEGAN_DIET" || event.message.quick_reply.payload === "VEG_DIET" || event.message.quick_reply.payload === "EGG_DIET" || event.message.quick_reply.payload === "NON_VEG_DIET") {


                DietPlanModule.quickReplyPostback(event.sender.id, event.message.quick_reply.payload);
              }
             if(event.message.quick_reply.payload==="Angry")
             {
               textMsg=process.env.ANGRY_AT;
               payload[0]="BOSS";
               title[0]="Boss";
               payload[1]="COLLEAGUE";
               title[1]="Colleague";
               payload[2]="FAMILY";
               title[2]="family";
               payload[3]="MYSELF";
               title[3]="Myself";
               functionController.quickReply(event.sender.id,title,payload,textMsg);
             }
             if(event.message.quick_reply.payload==="BOSS")
             {
               textMsg=process.env.PROJECT_WRONG;
               payload[0]="PROJECT_WRONG_YES";
               title[0]="Yes";
               payload[1]="PROJECT_WRONG_NO";
               title[1]="No";
               functionController.QuickReplyForTwo(event.sender.id,title,payload,textMsg);
             }
             if(event.message.quick_reply.payload==="PROJECT_WRONG_YES")
             {
               textMsg=process.env.FAULT;
               payload[0]="FAULT_YES";
               title[0]="Yes";
               payload[1]="FAULT_NO";
               title[1]="No";
               functionController.QuickReplyForTwo(event.sender.id,title,payload,textMsg);
             }
             if(event.message.quick_reply.payload==="FAULT_YES")
             {
               textMsg="What has happened has happened their nothing you can't do about it don't worry too much about it.";
               functionController.replyWithPlainText(event.sender.id,textMsg);
               textMsg=process.env.BETTER_NOW;
               payload[0]="BETTER_YES";
               title[0]="Yes";
               payload[1]="BETTER_NO";
               title[1]="No";
               setTimeout(function(){
                 functionController.QuickReplyForTwo(event.sender.id,title,payload,textMsg);
               },2000);
             }
             if(event.message.quick_reply.payload==="BETTER_YES")
             {
               textMsg="Well, I want to cheer you up.";
               functionController.replyWithPlainText(event.sender.id,textMsg);

             }
             if(event.message.quick_reply.payload==="BETTER_NO")
             {
               textMsg="OK, Feel free to talk to me Anytime.";
               functionController.replyWithPlainText(event.sender.id,textMsg);
             }
            } else {//message is text type
              //call facebook api to get user name and gender
                  if(event.sender.id!=process.env.PAGE_ID)
                  {
                    request({
                      url: process.env.FACEBOOK_GRAPH_URL + event.sender.id,
                      qs: {
                        access_token: process.env.FACEBOOK_TOKEN,
                      },
                      method: "GET"
                    }, function(error, response, body) {
                      if (!error && response.statusCode == 200) {
                        var parsed = JSON.parse(response.body);
                        var userName = parsed.first_name;
                        var gender = parsed.gender;
                        console.log("user gender:",gender);
                        //find if user already stored in database
                        User.findOne({
                          user_id: event.sender.id
                        }).exec(function(err, result) {
                          if (!err) {
                            title[0] = process.env.TITLE;
                            payload[0] = process.env.PAYLOAD_TITLE;
                            var re = new Regex(/[1-99][Age]+/);
                             //user is not stored
                            if (_.size(result) == 0) {
                             //save user detail
                              User({
                                user_id: event.sender.id,
                                name: userName,
                                gender: gender,
                                is_bmr: false,
                                is_reminder: false
                              }).save(function(err, data) {
                                if (err) throw err;
                                console.log("user store:", data);
                              });
                              //not in use this if statement

                              if(/[1-9]?[0-9]+/i.test(event.message.text))
                              { //text is numeric type
                                //find second last webhook text message
                                WebhookHistory.findOne({}).sort({seq:-1}).exec(function(err,data){
                                  if(!err)
                                  {
                                    if(_.size(data)==0)
                                    {
                                      console.log("web history not found");
                                      console.log("start bot with hi");
                                      functionController.callApiAi(event.sender.id,event.message.text);
                                    }
                                    else {
                                      console.log("data found:",data);
                                      if(data.text=="Oh! I don't know.  How about your favorite book?")
                                      {
                                        title[0]="Yes";
                                        payload[0]="BOOK_YES";
                                        title[1]="No";
                                        payload[1]="BOOK_NO";
                                        textMsg="Do you prefer books?";
                                        functionController.quickReply(event.sender.id,title,payload,textMsg);
                                      }

                                    }

                                  }
                                  else {
                                    console.log("error in webhook history");
                                  }
                                })
                              }
                              else if(/[a-z]+/i.test(event.message.text))
                              { //text is numeric type
                                //find second last webhook text message
                                WebhookHistory.findOne({}).sort({seq:-1}).exec(function(err,data){
                                  if(!err)
                                  {
                                    if(_.size(data)==0)
                                    {
                                      console.log("web history not found");
                                      console.log("start bot with hi");
                                      functionController.callApiAi(event.sender.id,event.message.text);
                                    }
                                    else {
                                      console.log("data found:",data);
                                      if(data.text==process.env.ASK_FOR_AGE)
                                      {

                                      functionController.replyWithPlainText(event.sender.id,process.env.TEXT_INTEGER);
                                      functionController.replyWithPlainText(event.sender.id,process.env.ASK_FOR_AGE);
                                      }

                                      else {
                                        console.log("start bot with hi");
                                        functionController.callApiAi(event.sender.id,event.message.text);
                                      }
                                    }

                                  }
                                  else {

                                  }
                                })
                              }
                               else {
                                textMsg = event.message.text + " " + userName + ", get fit with Nestle, your companion to good health.";
                                //receivedMessage(event, textMsg);title,payload
                                functionController.replyWithPlainText(event.sender.id, textMsg);
                                textMsg1 = "You need a variety of nutrients to strengthen your performance and endurance. Let's guide you on daily nutrition. To start over type \"Hi\" any time.";
                                functionController.receivedMessage(event.sender.id, title, payload, textMsg1);

                              }

                            } else {//user is already stored
                              console.log("string length", _.size(event.message.text));

                             if (/[1-9]?[0-9]+\sgram/i.test(event.message.text)) {//text message is end with gm
                                PortionGuidanceModule.portionGuidanceModuleTextMessage(event.sender.id, event.message.text);
                              }
                               else if (/[1-9]?[0-9]+\slitre/i.test(event.message.text)) {//text message is end with litre
                                PortionGuidanceModule.portionGuidanceModuleTextMessage(event.sender.id, event.message.text);

                              } else if (/[1-9]?[0-9]+\srice/i.test(event.message.text)) {//text message is end with rice

                                PortionGuidanceModule.portionGuidanceModuleTextMessage(event.sender.id, event.message.text);
                              } else if (/[a-z]+\smeat/i.test(event.message.text)) {//text message is end with meat
                                PortionGuidanceModule.portionGuidanceModuleTextMessage(event.sender.id, event.message.text);
                              } else if (/[a-z]+\ssize/i.test(event.message.text)) {//text message is end with size
                                PortionGuidanceModule.portionGuidanceModuleTextMessage(event.sender.id, event.message.text);
                              } else if (/[a-z]+\scmp/i.test(event.message.text)) {//text message is end with cmp
                                PortionGuidanceModule.portionGuidanceModuleTextMessage(event.sender.id, event.message.text);
                              } else if (/[1-9][0-9]+\scalorie/i.test(event.message.text)) {//text message is end with calorie
                                GameModule.gameModuleTextMessage(event.sender.id, event.message.text);
                              } else if (/[1-9][0-9]?\syears/i.test(event.message.text)||/[1-9][0-9]?\syrs/i.test(event.message.text)||/[a-z]+\syears/i.test(event.message.text)) {//text message is end with age
                                //save age of use
                                BmrCalculateModule.TextMessage(event.sender.id, event.message.text);
                              } else if (/[1-9][0-9]?\sfe?e?t,?[1-9]?[0-9]?\s?i?n?c?h?e?s?/i.test(event.message.text)||/[a-z]+\sfe?e?t,?[a-z]*?\s?i?n?c?h?e?s?/i.test(event.message.text)) {//text message is end with feet,inches
                                BmrCalculateModule.TextMessage(event.sender.id, event.message.text);
                              } else if (/[1-9][0-9]?[0-9]?\sKg/i.test(event.message.text)||/[a-z]+\sKg/i.test(event.message.text)) { //text message is end with kg
                                //console.log("weight is received");
                                BmrCalculateModule.TextMessage(event.sender.id, event.message.text);
                              } else if (/[1-9]+\snaan/i.test(event.message.text) || /[1-9]+\sbutter\schicken/i.test(event.message.text) || /[1-9]+\splate\srice/i.test(event.message.text)) {
                                //text message is end with naan, butter chicken ...
                                 //call calorie calculate api for naan, butter chicken ...
                                request({
                                  url: process.env.GET_CALORIE_URL + event.message.text,
                                  method: "GET"
                                }, function(error, response, body) {
                                  if (!error) {
                                    var result = JSON.parse(response.body);
                                    console.log("result:", result);
                                    //get user name
                                    User.find({
                                      user_id: event.sender.id
                                    }).exec(function(err, data) {
                                      if (!err) {
                                        console.log("name", data);
                                        var textMsg = "Hey " + data[0].name + ", Here'\s your answer\n" + result.set_variables.totalcalories + "\n Make sure you read the label and control the portion you take.";
                                        title[0] = process.env.PORTION_GUIDANCE;
                                        title[1] = process.env.READING_MANUAL;
                                        payload[0] = process.env.PAYLOAD_PORTION;
                                        payload[1] = process.env.PAYLOAD_MANUAL;
                                      //reply with two payload
                                        functionController.replyWithTwoPayload(event.sender.id, title, payload, textMsg);
                                      }
                                    })

                                  } else {
                                    console.error("Unable to send message.");
                                    //console.error(response);
                                    console.error(error);
                                  }
                                  console.log("hello");


                                });

                              } else if (/hi/i.test(event.message.text)) {//start bot with hi message

                                payload[0]="ANGRY";
                                title[0]="Angry";
                                payload[1]="SAD";
                                title[1]="Sad";
                                payload[2]="BROKEN";
                                title[2]="Broken";
                                payload[3]="DEPRESSED";
                                title[3]="Depressed";
                                textMsg=process.env.FEELING;
                                functionController.quickReply(event.sender.id, payload, title, textMsg);
                              }

                              else if(/[1-9]?[0-9]+/i.test(event.message.text))
                              { //text is numeric type
                                //find second last webhook text message
                                WebhookHistory.find({}).sort({seq:-1}).limit(1).exec(function(err,data){
                                  if(!err)
                                  {
                                    console.log("data found ",data);
                                    if(data[0].text==process.env.ASK_FOR_AGE)
                                    {
                                      console.log("update age");
                                      BmrCalculateModule.updateAge(event.sender.id,event.message.text);
                                    }
                                    else if(data[0].text==process.env.ASK_FOR_HEIGHT)
                                    {
                                      console.log("height update");
                                    BmrCalculateModule.updateHeight(event.sender.id, event.message.text);
                                    }
                                    else if(data[0].text==process.env.ASK_FOR_WEIGHT)
                                    {
                                    BmrCalculateModule.updateWeight(event.sender.id,event.message.text);
                                    }
                                    else if(data[0].text==process.env.TEXT_RICE)
                                    {
                                    console.log("text rice");
                                    functionController.rice(event.sender.id);
                                    }
                                    else if(data[0].text==process.env.TEXT_CHAPATTI)
                                    {
                                    console.log("text chapatti");
                                    functionController.sizeChapatti(event.sender.id);
                                    }
                                    else if(data[0].text==process.env.TEXT_CHEESE)
                                    {
                                    console.log("text cheese");
                                    functionController.compare(event.sender.id);
                                    }
                                    else if(data[0].text==process.env.TEXT_MEAT)
                                    {
                                    console.log("text MEAT");
                                    functionController.meat(event.sender.id);
                                    }
                                    else if(data[0].text==process.env.TEXT_DAL)
                                    {
                                    console.log("text DAL");
                                    functionController.gram(event.sender.id);
                                    }
                                    else if(data[0].text==process.env.TEXT_MILK)
                                    {
                                    console.log("text MILK");
                                    functionController.endAsking(event.sender.id);
                                    }
                                    else if(data[0].text==process.env.TEXT_CALORIE)
                                    {
                                    console.log("CALORIE");
                                    functionController.pizzaCalorie(event.sender.id);
                                    }
                                  else if(data[0].text==process.env.TEXT_MSG_CALORIE_CALCULATOR)
                                    {
                                    functionController.calorieForDish(event.sender.id,event.message.text);
                                    }
                                    else {
                                      console.log("start bot with hi 1");
                                      functionController.callApiAi(event.sender.id,event.message.text);
                                    }
                                  }
                                  else {
                                    console.log("error in webhook history");
                                  }
                                })
                              }
                              else if(/[a-z]+/i.test(event.message.text))
                              { //text is numeric type
                                //find second last webhook text message
                                WebhookHistory.find({}).sort({seq:-1}).limit(1).exec(function(err,data){
                                  if(!err)
                                  {
                                    console.log("data found:",data);
                                    if(data[0].text=="Oh! I don't know.  How about your favorite book?")
                                    {
                                      title[0]="Yes";
                                      payload[0]="BOOK_YES";
                                      title[1]="No";
                                      payload[1]="BOOK_NO";
                                      textMsg="Do you prefer books?";
                                      functionController.quickReply(event.sender.id,title,payload,textMsg);
                                    }
                                    else if(data[0].text==process.env.ASK_FOR_AGE)
                                    {

                                    functionController.replyWithPlainText(event.sender.id,process.env.TEXT_INTEGER);
                                    functionController.replyWithPlainText(event.sender.id,process.env.ASK_FOR_AGE);
                                    }
                                    else if(data[0].text==process.env.ASK_FOR_HEIGHT)
                                    {
                                      console.log("height update");
                                      functionController.replyWithPlainText(event.sender.id,process.env.TEXT_INTEGER);
                                      functionController.replyWithPlainText(event.sender.id,process.env.ASK_FOR_HEIGHT);
                                    }
                                    else if(data[0].text==process.env.ASK_FOR_WEIGHT)
                                    {
                                      functionController.replyWithPlainText(event.sender.id,process.env.TEXT_INTEGER);
                                      functionController.replyWithPlainText(event.sender.id,process.env.ASK_FOR_WEIGHT);
                                    }
                                    else if(data[0].text==process.env.TEXT_RICE)
                                    {
                                    console.log("text rice");
                                    functionController.rice(event.sender.id);
                                    }
                                    else if(data[0].text==process.env.TEXT_CHAPATTI)
                                    {
                                    console.log("text chapatti");
                                    functionController.sizeChapatti(event.sender.id);
                                    }
                                    else if(data[0].text==process.env.TEXT_CHEESE)
                                    {
                                    console.log("text cheese");
                                    functionController.compare(event.sender.id);
                                    }
                                    else if(data[0].text==process.env.TEXT_MEAT)
                                    {
                                    console.log("text MEAT");
                                    functionController.meat(event.sender.id);
                                    }
                                    else if(data[0].text==process.env.TEXT_DAL)
                                    {
                                    console.log("text DAL");
                                    functionController.gram(event.sender.id);
                                    }
                                    else if(data[0].text==process.env.TEXT_MILK)
                                    {
                                    console.log("text MILK");
                                    functionController.endAsking(event.sender.id);
                                    }
                                    else if(data[0].text==process.env.TEXT_CALORIE)
                                    {
                                    console.log("CALORIE");
                                    functionController.pizzaCalorie(event.sender.id);
                                    }
                                    else if(data[0].text==process.env.TEXT_MSG_CALORIE_CALCULATOR)
                                    {
                                    functionController.calorieForDish(event.sender.id,event.message.text);
                                    }

                                    else {
                                      console.log("start bot with hi 2");
                                      functionController.callApiAi(event.sender.id,event.message.text);
                                    }
                                  }
                                  else {

                                  }
                                })
                              }

                              else {
                             functionController.callApiAi(event.sender.id,event.message.text);
                              }


                            }
                          } else {
                            // error handling
                            console.log("error in find command");
                          };
                        });
                      } else {
                        console.error("Unable to send message.");
                        //  console.error(response);
                        //  console.error(error);
                      }
                      console.log("hello");
                    });
                  }



              WebhookHistory.find({}).sort({seq:-1}).limit(1).exec(function(err,data){
                if(!err)
                {
                  console.log("data in webhistory",data.length);
                if(data.length==0)
                {
                  data=[{
                    seq:process.env.ZERO,
                    text:process.env.HELLO
                  }];
                }
               console.log("sequence no.",data[0].seq);
               WebhookHistory({
                 seq:data[0].seq+1,
                 text:event.message.text
               }).save(function(err,data){
                 if(!err)
               console.log("data stored in webhook collection:",data);
               else
               console.log("webhook is not saved");
               });
                }
                else {
                  console.log("error in webhook history storing");
                }
              });
            }
            //receivedMessage(event,textMsg)
          }

        });
      });

      // Assume all went well.
      //
      // You must send back a 200, within 20 seconds, to let us know
      // you've successfully received the callback. Otherwise, the request
      // will time out and we will keep trying to resend. hello
      res.sendStatus(200);
    }
  });
}
