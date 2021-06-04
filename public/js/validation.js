
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
        fname:{
            required:true,
            minlength:4,
            alphanumeric: true
        },
        lname:{
            required:true,
            minlength:4,
            alphanumeric: true
        },
        occupation:{
            required:true,
        },
        country:{
            minlength:4,
            required:true,
            alphanumeric: true
        },
        city:{
            minlength:4,
            required:true,
            alphanumeric: true
        },
        state:{
            minlength:4,
            required:true,
            alphanumeric: true
        }, 
        pincode:{
            minlength:4,
            required:true,
            numeric:true,
        },
        address:{
            required:true,
            minlength:4,
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
        payment_method:{
            required: true, 
        },
        pass: {
            required: true,
            minlength:4,
            maxlength:10
        },
        confirm:{
            required:true
        },
        otp:{
            required:true,
            minlength:6,
            maxlength:6
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
        price:{
            required:true,
            numeric:true,
        },
        offerPrice:{
            required:true,
            numeric:true,
        },
        endingTime:{
            required:true,
        },
        discription:{
            required:true,
        },
        image2:{
            required:true,

        },
        cname:{
            required:true,
            minlength:4,
            alphanumeric: true
        },
        coname:{
            required:true,
            minlength:4,
            alphanumeric: true
        },
        code:{
            required:true,
            minlength:6,
            maxlength:6,
        },
        redeemAmount:{
            required:true,
            numeric:true,
        },
        proname:{
            required:true,
        },


    },
    messages:{ //error message for the required field
        fname: {
            required: 'Please Enter Your First Name',
            alphanumeric: 'Enter Only Charactors',
            minlength:'Enter minimum 4 charractors',
        },
        lname: {
            required: 'Please Enter Your Last Name',
            alphanumeric: 'Enter Only Charactors',
            minlength:'Enter minimum 4 charractors',
        },
        occupation:{
            required: 'Please Enter Your Occupation',
        },
        country:{
            required: 'Please Enter Your Country Name',
            alphanumeric: 'Enter Only Charactors',
            minlength:'Enter minimum 4 charractors',
        },
        city:{
            minlength:'Enter minimum 4 charractors',
            required: 'Please Enter Your City Name',
            alphanumeric: 'Enter Only Charactors',
        },
        state:{
            minlength:'Enter minimum 4 charractors',
            required: 'Please Enter Your State Name',
            alphanumeric: 'Enter Only Charactors',
        }, 
        pincode:{
            minlength:'Enter minimum 4 charractors',
            required: 'Please Enter Your Pincode',
        },
        address:{
            required:'Please Enter Your Address',
            minlength:'Enter minimum 4 charractors',
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
        payment_method:{
            required: 'Please select any payment method', 
        },
        pass: {
            required: 'Please Enter Your Password',
            maxlength:'Enter only 10 numbers',
            minlength:'Enter minimum 4 numbers'
        },
        confirm:{
            required:' '
        },
        otp:{
            required:'Please Enter Your OTP',
            minlength:'The OTP number want to be 6 digit',
            maxlength:'The OTP number is only 6 digit',
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
        price:{
            required:"Please Enter the price of product",
            numeric:"Enther only numbers",
        },
        offerPrice:{
            required:"Please Enter the Offer price of product",
            numeric:"Enther only numbers",
        },
        endungTime:{
            required:"Please Select the offer ending time",
        },
        discription:{
            required:'Please Enter discription '
        },
        image:{
            required:'Please choose the image file '
        },
        cname:{
            required:'Please enter the category '
        },
        coname:{
            required:'Please enter the coupon name '
        },
        code:{
            required:'Please enter the cupon code',
            minlength:'Please enter minimum 6 digits',
            maxlength:'Please enter only 6 digits',
        },
        redeemAmount:{
            required:"Please Enter the redeem amount",
            numeric:"Enther only numbers",
        },
        proname:{
            required:"Please Enter the product name",
        },
        
    },
    
}) 
     
})
