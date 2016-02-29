Template.orderMenu.helpers({
  items: function() {
    return ItemsData.find();
  }
});

Template.orderMenu.events({
  "click button[name='edit']": function(event, template){
     console.log(this);
     id = this._id;
     $("input#itemName").val(this.name);
     $("input#itemPrice").val(this.price);
  },
  "click button[name='saveChange']": function(event, template){
      if (typeof (id) !== "undefined") {
        console.log(id);
        ItemsData.update(id, {$set:{ name: $("input#itemName").val(), price: parseFloat($("input#itemPrice").val()).toFixed(2)
      }});
      delete id;
    } else {
      console.log("insert");
      ItemsData.insert({name: $("input#itemName").val(), price: parseFloat($("input#itemPrice").val()).toFixed(2)});
    }
  },
  "click button[name='cancel']": function(event, template){
    delete id;
  },
  "click input[name='addItem']": function(event, template){
    console.log("add");
    $("input#itemName").val("");
    $("input#itemPrice").val("");
  },
  "click button[name='delete']": function(event, template){
    console.log("remove");
    ItemsData.remove(this._id);
  }
});
