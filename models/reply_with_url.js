var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

module.exports =mongoose.model('ReplyWithUrl',
               new Schema({   id:String,
                 title: String,
                 subtitle:String,
                 image_url:String,
                 button_type: String,
                 payload_for:String,
                 b_t_p_title:String,
                 b_t_p_payload:String,
                 b_t_w_title:String,
                 b_t_w_url:String
               }),
               'reply_with_url_attachments');
