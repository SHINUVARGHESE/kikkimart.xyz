
jQuery.validator.addMethod("noSpace", function(value, element) { 
    return value == '' || value.trim().length != 0;  
  }, "No space please and don't leave it empty");
  jQuery.validator.addMethod("customEmail", function(value, element) { 
  return this.optional( element ) || /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/.test( value ); 
  }, "Please enter valid email address!");
  $.validator.addMethod("numeric", function(value, element) {
    return this.optional(element) || value == value.match(/^[0-9]+$/);
  }, "Numbers Only");
  $.validator.addMethod( "alphanumeric", function( value, element ) {
  return this.optional( element ) || value == value.match(/^[a-zA-Z\s]+$/);
  }, "Letters only" );
  
$(document).ready(function(){
$("#form").validate({
    rules:{
        name:{
            required:true,
            minlength:4,
            alphanumeric: true
        },
        mail: {
            required: true,
            customEmail: true
        },
        mobile: {
            required: true,
            minlength:10,
            maxlength:10,
            numeric:true,
            noSpace: true
        },
        pass: {
            required: true,
            minlength:4,
            maxlength:10
        },
        content:{
            required:true
        },
        pname:{
            required:true,
            minlength:3,
        },
        category:{
            required:true,
        },
        discription:{
            required:true,
        },
        image:{
            required:true,

        },
        cname:{
            required:true,
            minlength:4,
            alphanumeric: true
        }
    },
    messages:{
        name: {
            //error message for the required field
            required: 'Please Enter Your Name'
        },
        mail: {
            required: 'Please Enter Your mail id',
            alphanumeric:'Please Enter only charractors'
        },
        mobile: {
            required: 'Please Enter  Your Phone Number',
            maxlength:'Enter only 10 numbers',
            minlength:'Enter minimum 10 numbers'
        },
        pass: {
            required: 'Please Enter Your password',
            maxlength:'Enter only 10 numbers',
            minlength:'Enter minimum 4 numbers'
        },
        content:{
            required:'Please enter your message'
        },
        pname: {
            //error message for the required field
            required: 'Please Enter The Product Name'
        },
        category:{
            required:'Please Enter category of product '
        },
        discription:{
            required:'Please Enter discription '
        },
        image:{
            required:'Please choose the image file '
        },
        cname:{
            required:'Please enter the category '
        }
        
    },
    
    
}) 
     
})
