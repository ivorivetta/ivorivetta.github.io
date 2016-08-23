// console.log('fix z depth of input and button')
// console.log('return key event on input')
// console.log('fade search away until typing to regain focus')

// UI
/// Button click
$(function() {
  $('a#search').bind('click', function() {updateTranslate()});
});
/// keyboard
$(function() {
  $('input').bind('keyup', function(event) {
    if(event.keyCode == 13) {
      $('a#search').click();
    }
  })
});

// DOM wrappers
function updateTranslate() {
    console.log('button clicked')

    var word = $('input[name="a"]').val();
    console.log(word)

        if (word.length!==0) {
          //test
          // $("div.resultWrap").show();
          // $("div.intro").hide();
          // debugger;
          //live
          $("div.resultBlock").remove();
          $("div.resultWrap").append($('<div></div>').addClass('resultBlock'));
          $("div.intro").hide();
            getHugeThesaurus(word);
            getUrbanDictionary(word);
            grabGoogleImage(word);
          $("div.resultWrap").show(); // override any test settings
        }
    return false;
};

function getHugeThesaurus(word) {
    var getPath = 'http://words.bighugelabs.com/api/2/2cda4f7eed9e039dfd2aa26e4b5787b0/' + word + '/json';

    $.getJSON(getPath, 
        {
            // No data sent
            // b: $('input[name="b"]').val()
        },
        function(result) {
            console.log('thesaurus:')
            console.log(result)
            prependList(word, result, 'Thesaurus');
            }
    );

}

function getUrbanDictionary(word) {
    var getPath = 'https://mashape-community-urban-dictionary.p.mashape.com/define?term=' + word;
    
    $.ajax({
        url: getPath,
        data: {},
        type: "GET",
        headers: {"X-Mashape-Key":'pREJCKXoOxmshEm4qu9Aec2FUo5Jp1r1vgqjsn1WnER2FMybas',"Accept":"text/plain"},
        success: function(result){
            // console.log(result)
            result = {slang: {sim: result.tags}};
            prependList(word,result,'Urban Dictionary')
            }
        });


}

function prependList(word, result, ref) {
    // maps an object to a header-list display in the DOM, then updates display

    // new div <div class="resultBlock" id="thesaurus" name="word">
    var section = $("<div></div>").addClass("resultList").attr({
        name: word,
        id: "thesaurus"
    });
    section.hide();

    // add H1
    var text = ref + " results for " + word + ":";
    var sectionTitle = $("<h3></h3>").text(text);
    // console.log(sectionTitle);
    // $("div.resultBlock").append(sectionTitle);
    section.append(sectionTitle);

    // section.prepend($("<h2></h2>").text([ref + " results for " + word + ":"]));
    // console.log(section)
    // console.log($("<h2></h2>").text([ref + " results for " + word + ":"]));
    // debugger;
    var x;
    for (x in result) {
        // console.log(x)
        // returns span + list, append to div
        var category = listThesaurus(x,result);
        section.append(category);
    }

    // prepend div
    $("div.resultBlock").append(section);
    section.show();
    // show div


    function listThesaurus(x,result) {

            var category = $("<span></span>").text("type: " + x).addClass("objectList");
            for (line in result[x]) {
                try {
                    // Parse Sub-categories
                    if (line == "syn") {
                        var list = $("<ul></ul>").text("Synonyms:")
                    } else if (line == "sim") {
                        var list = $("<ul></ul>").text("Similar:")
                    } else if (line =="ant") {
                        var list = $("<ul></ul>").text("Antonyms:")
                    }
                //build li's
                var items = result[x][line]
                    for (item in items) {
                        var item = $("<li></li>").text(items[item]);
                        list.append(item)
                    }
                category.append(list)
                }
                catch (err) {};
            }

            return category
    }

    return null
}


function grabGoogleImage(word) {
    var section = $("<div></div>").addClass("resultList").attr({
        name: word,
        id: "imgLink"
    });
    section.hide();


    var imgSearchURL = "https://www.google.com/search?site=&tbm=isch&source=hp&biw=1440&bih=741&q=" + word + "&oq=" + word + "&gs_l=img.3..0l10.1666.2519.0.3252.6.5.0.1.1.0.86.374.5.5.0....0...1ac.1.64.img..0.6.375.GPx1sP01W-g";

    var link = $("<a></a>").text('See Google Image results >').attr({
        href: imgSearchURL,
        target: "_blank"
    });

    section.append(link);

    $("div.resultBlock").append(section);
    section.show();


}

    // .next()
    // .eq(1) pulls the item at that index
    // .hide(), .show(), .toggle() for visibility
    // var section = $( ".thesaurus"); // Grabs the class "thesauraus"
    // <p> with id and visibility
    // print object prop as h2
    // list contents


        // // x becomes span, append to section
        // // for (line in )
        // console.log(result[x]);
        // // returns ul, append to span (category)
        // var list = listThesaurus(result);

        // contents become list, append to span

    // var section = $( "#thesaurus[name='testWord']"); // Grabs the ID "thesauraus"

    // console.log(section)
    // console.log(section.find("span"))//".objectList"))
    // console.log("for x in ")

        // DOM manipulation
    // // ex:
    // function appendText() {
    //     var txt1 = "<p>Text.</p>";               // Create element with HTML  
    //     var txt2 = $("<p></p>").text("Text.");   // Create with jQuery
    //     var txt3 = document.createElement("p");  // Create with DOM
    //     txt3.innerHTML = "Text.";
    //     // $("body").prepend(txt1, txt2, txt3);      // Append the new elements 






jQuery(document).ready(function($) {
  $("div.resultWrap").hide(); // Hides test block

    // $(".scroll").click(function(event){
    // console.log('#1')   
    // event.preventDefault();
    // $('html,body').animate({scrollTop:$(this).offset().top}, 10,'swing');
    // });

  $(window).resize(function(){
      // console.log("height:" + $(window).height())
      // console.log("width:" + $(window).width())
      });



});
