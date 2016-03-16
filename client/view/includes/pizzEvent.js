Template.pizzaEvent.events({
  "click button[name='create']": function(event, template){
     var eventName = $('input#eventName').val();
     var onDate = new Date($('input#onDate').val());
     //console.log(eventName + "\t" + onDate);
     //$('input#onDate2').val(onDate.toISOString().split('T')[0]);
     PizzaEvent.insert({name: eventName,
       onDate: onDate.toISOString().split('T')[0],
       group: Meteor.user().profile.group,
       status: "ordering",
       eventCreator: Meteor.user().username,
       usersAccept: [Meteor.user().username],
       usersReject: [""]
     });
  },
  "click button#addToChart": function(event, template){
    var eventId = this._id;
    var itemId = $('select[name="items-' + eventId + '"] option:selected').data("itemid");
    var itemCount = $('input[name="itemCount-' + eventId + '"]').val();
    PizzaEvent.update({_id: eventId}, {$push: {order: {"itemId": itemId, "count": itemCount, "user": Meteor.user().username}}});
    //console.log(ItemsData.findOne({_id: itemId}).name + "\t" + itemCount);
  },

  "click button#seeOrder" : function(event, template){
    var eventId = this._id;
    var oldElem;
    var addRow;
    var elem = $('div[name="item"]');
    elem.html("");
    var item;
    var count, price, total = 0;
    var order = PizzaEvent.findOne({_id: eventId, group: Meteor.user().profile.group}, {sort: {onDate: 1}}).order;
    for (var i = 0; i < order.length; i++){
      if(order[i].user == Meteor.user().username){
        item = ItemsData.findOne({_id: order[i].itemId});
        count = parseInt(order[i].count);
        price = parseFloat(item.price);
        oldElem = elem.html();
        total += price*count;
        addRow = '<div class="row">'+ item.name + ' (' + price + '$) x ' + count + ' = ' + price*count + '$ </div>';
        elem.html(oldElem + addRow);
      }
    }
    elem = $('input[name="totalCost"]');
    elem.val("Total cost: " + total + " $");
  },

  "change select[name='orderStatus']": function(event, template){
    var orderStatus = $('select[data-eventId='+ this._id +']')[0].value;
    PizzaEvent.update({_id: this._id}, {$set: {status: orderStatus}});

    //send email if status change on ordered
    if(orderStatus == 'ordered') {
      var eventId = this._id;
      var orderToSend;
      var emailToUser;
      var item, count, price, total = 0;
      var order = PizzaEvent.findOne({_id: eventId, group: Meteor.user().profile.group}, {sort: {onDate: 1}}).order;
      var usersAccept = PizzaEvent.findOne({_id: eventId, group: Meteor.user().profile.group}, {sort: {onDate: 1}}).usersAccept;
      var eventCreator = PizzaEvent.findOne({_id: eventId, group: Meteor.user().profile.group}, {sort: {onDate: 1}}).eventCreator;

      for(var j = 0; j < usersAccept.length; j++){
        orderToSend = "Your order:\n";
        total = 0;
        for (var i = 0; i < order.length; i++){
          if(usersAccept[j] == Meteor.user().username){
            item = ItemsData.findOne({_id: order[i].itemId});
            count = parseInt(order[i].count);
            price = parseFloat(item.price);
            total += price*count;
            orderToSend += '\t'+ item.name + ' (' + price + '$) x ' + count + ' = ' + price*count + '\n';
          }
        }
        orderToSend += 'You must give: '  + total + '$, to \"' + eventCreator + '\"';
        emailToUser = usersAccept[j];
        Meteor.call("sendEmail", emailToUser , this.name, orderToSend);
    }
  }
  },
  "click button[name=acceptEvent]": function(event, template) {
    PizzaEvent.update({_id: this._id}, {$push: {usersAccept: Meteor.user().username}});
  },
  "click button[name=rejectEvent]": function(event, template) {
    PizzaEvent.update({_id: this._id}, {$push: {usersReject: Meteor.user().username}});
  }
});
Template.pizzaEvent.helpers({
  events: function(){
    //return PizzaEvent.find({group: Meteor.user().profile.group}, {sort: {onDate: 1}});
    var user = Meteor.user().username;
    var events = PizzaEvent.find({group: Meteor.user().profile.group}, {sort: {onDate: 1}}).fetch();
    for(var i = 0; i < events.length; i++) {
      var userAccept = PizzaEvent.findOne({_id: events[i]._id, usersAccept: {$in: [user]}});
      var userReject = PizzaEvent.findOne({_id: events[i]._id, usersReject: {$in: [user]}});
      if (userAccept || userReject){
        events[i].userConfirm = true;
      } else {
        events[i].userConfirm = false;
      }
    }
    return events;
  },
  groupMenu: function(){
    return ItemsData.find({group: Meteor.user().profile.group});
  }
});

Template.registerHelper("compare", function(v1, v2){
  if (typeof v1 === 'object' && typeof v2 === 'object') {
    return _.isEqual(v1, v2); // do a object comparison
  } else {
    return v1 === v2;
  }
});

Template.registerHelper("userAccept", function(eventId, user){
  //console.log(eventId + "\t" + user);
  if (PizzaEvent.findOne({_id: eventId, usersAccept: {$in: [user]}})) {
    return true;
  } else {
    return false;
  }
});
