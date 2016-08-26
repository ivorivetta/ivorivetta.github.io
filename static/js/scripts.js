document.getElementById("menuBar").addEventListener("click", function(){
    // debugger;
    console.log('click')
    var intro = document.getElementById("intro");
    if (intro.style.opacity == 1) {
        intro.style.opacity = 0;
    } else if (intro.style.opacity == 0) {
        intro.style.opacity = 1;
    }
    else {}
},false);