function getUserType(){
    console.log("hejfbsdkjfhlsdkflsdkgklsdj;dsjf;lsdfm;sldf");
    // const dom = new JSDOM.fromFile(`/users/addUser.pug`);
    console.log(document.getElementsByClassName("selectType"));
    console.log("BIIIIIIIIIIIIIIIIIIIIIITCH");
    var selectTypeArray = document.getElementsByClassName("selectType");
    var i=0;
    var allSelectedElements=[];
    for(i=0; i<selectTypeArray.length; i++){
      if(selectTypeArray[i].value==1 || selectTypeArray[i].value==2){
        allSelectedElements.push(selectTypeArray[0].parentNode.parentNode.parentNode.childNodes[1].innerText);
      }
        
    }
    console.log(allSelectedElements);
    return allSelectedElements;
  }