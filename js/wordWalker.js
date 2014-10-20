/* WordWalker
	
	Dual licensed under the MIT license (below) and GPL license.

	MIT License

	Copyright (c) 2014 David Weinberger

	Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

   David Weinberger, david@weinberger.org
   Oct. 20, 2014

*/
function Book(img,title,author,subject,year,hollisid,abs,toc){
	this.img = img;
	this.title = title;
	this.author = author;
	this.subject=subject;
	this.year = year;
	this.hollisid=hollisid;
	this.abstract = abs;
	this.toc = toc;
}

var gbookline = [];


function init(){

	
	// pressing enter submits the search
	$("#searchbox").keypress(function(e){
		if (e.which === 13){
			startSearch();
			$("#searchbox").blur(); // remove focus
			event.preventDefault();
			return false;
		}
	});
	
	// clicking into searchbox hides the pulldowns
	$("#searchbox").click(function(e){
		$("#explanation").slideUp(300);
		$("#about").slideUp(300);
	});
		
}	
	
function createClickableText(whichbk){
	//Build div with clickable text from author, subjects, titles, abstract, toc
	
	// mark div as clickedbox
	$(".clickedbook").removeClass("clickedbook");
	$("#book" + whichbk).addClass("clickedbook");
	
	var bk = gbookline[whichbk];
	var buttontext = "";
	$("#titlecontent").html("");
	$("#authorcontent").html("");
	$("#subjectcontent").html("");
	$("#abstractcontent").html("");
	$("#toccontent").html("");
	$("#markeduptext").slideDown(300);
	 
	 if ( (bk["title"] !== undefined) && (bk["title"].length !== 0) ){
	 	buttontext = buttonizeText(bk["title"].join(": "),"title");
	 	$("#titlecontent").html(buttontext);
	 	$("#titlecontainer").show(300);
	 }
	 else {
	 	$("#titlecontent").html("");
	 	$("#titlecontainer").hide(300);
	 }
	 
	  if ( (bk["subject"] !== undefined) && (bk["subject"].length !== 0) ){
	 	buttontext = buttonizeText(bk["subject"].join(" "),"subject");
	 	$("#subjectcontent").html(buttontext);
	 	$("#subjectcontainer").show(300);
	 }
	 else {
	 	$("#subjectcontent").html("");
	 	$("#subjectcontainer").hide(300);
	 }
	
	 if ( (bk["author"] !== undefined) && (bk["author"].length !== 0) ){
	 	buttontext = buttonizeText(bk["author"].join(" "),"author");
	 	$("#authorcontent").html(buttontext);
	 	$("#authorcontainer").show(300);
	 }
	 else {
	 	$("#authorcontent").html("");
	 	$("#authorcontainer").hide(300);
	 }
	 
	 if ( (bk["abstract"] !== undefined) && (bk["abstract"] !== "") ){
	 	var abs = bk["abstract"].join("<br>");
	 	buttontext = buttonizeText(abs,"abstract");
	 	$("#abstractcontent").html(buttontext);
	 	$("#abstractcontainer").show(300);
	 }
	 else {
	 	$("#abstractcontent").html("");
	 	$("#abstractcontainer").hide(300);
	 }
	 
	 if ( (bk["toc"] !== undefined) && (bk["toc"] !== "") ){
	 	buttontext = buttonizeText(bk["toc"],"toc");
	 	$("#toccontent").html(buttontext);
	 	$("#toccontainer").show(300);
	 }
	 else {
	 	$("#toccontent").html("");
	 	$("#toccontainer").hide(300);
	 }
	 
	 
}

function buttonizeText(txt,section){
	// create clickable text out of plain text
	
	// replace the "--" with spaces
	var txt2 = txt.replace(/--/g, ' ');
	// turn it into an array
	var txtarray = txt2.split(" ");
	// ignore stop words
	var trimmed="", word="", s="";
	for (i=0; i < txtarray.length; i++){
		word = txtarray[i];
		// trim it
		trimmed = trimdw(word);
		if (checkStopWord(trimmed)){
			s = s + trimmed + " ";
		}
		else { // it's not a stop word
			var id = "word" + i + section;
			s = s + "<span class='realword' id='" + id + "' onclick='addWord(\"" + id + "\")'>" + trimmed + "</span> ";
		}
	}

	// show the search button
	$("#listsearchbtn").show();
	$("#searchwordtitle").show(300);
	return s;	

}

function addWord(id){
	if ($("#listedwords").children().length > 10){
		alert("Too many search terms. Ten is the maximum.");
			return;
	}
	
	// get the word element that was clicked on
	var wordel = document.getElementById(id);
	// get the word from that element
	var word = $(wordel).text();
	// create a div for this word
	var worddiv = document.createElement("span");
	worddiv.setAttribute("class","listedwordspan");
	// create a span for this word
	var wordspan = document.createElement("span");
	wordspan.setAttribute("class","listedword");
	wordspan.setAttribute("id", "listed_" + id);
	$(wordspan).html(word);
	$(worddiv).append(wordspan);
	// create controller span for this word
	var controlspan = document.createElement("span");
	controlspan.setAttribute("class","wordcontrol");
	controlspan.setAttribute("controls", "listed_" + id);
	controlspan.setAttribute("onclick","removeWord(this)");
	$(controlspan).html("x");
	$(worddiv).append(controlspan);
	$("#listedwords").append(worddiv);
	
	// show the remove button
	$("#listclearbtn").show(300);
	
}

function removeWord(el){
	
	var parel = $(el).parent();
	$(parel).fadeOut(300, function(e){
		$(parel).remove();
	});
}

function showWordControl(el){
	// get xy of this wordspan
	var r = el.getAttribute("top");
	var c = el.getAttribute("left");
	var wid = el.getAttribute("width");
	var top = r;
	var left = wid + c;
	$(el).css({"top" : top, "left" : left});
	$(el).show();
}

function startSearch(){
	// pressed the keyword search button
	
	// get the search term
	var searchterm = $("#searchbox").val();
	if (searchterm == ""){ // error check
		alert("Enter a subject to search for");
		return
	}
	
	fetchBooks(searchterm);
}

function fetchBooks(term){
	
	// do the search, get some books, parse the json, get an array of books for this line, display the line
	
	 $("#loading").show();
	 
		$.ajax({
			type: "POST",
			data: {searchterm  : term},
			 url: './php/fetchHollis.php',
			 success: function(r,mode){
					layoutHollisBooks(r);
					$("#loading").hide();        
				},
			error: function(r,mode){
				$("#loading").hide(); 
				alert("Oops. Query failed. Click somewhere else.");
			}
	  });
 
}

function layoutHollisBooks(resp){
	var jsn = JSON.parse(resp); // turn the response into json
  	var items = jsn.items;
	gbookline = [];
	
	for (var i=0; i < items.length; i++){
			var tempbook = new Book(); // to hold each book as created from json
			
			// use jquery library to get arrays of items we care about
			var subjarray =  $(items[i]).parseItemJSON("subject");
			tempbook["subject"] = subjarray;
			var autharray =  $(items[i]).parseItemJSON("author");
			tempbook["author"] = autharray;
			var titlearray =  $(items[i]).parseItemJSON("title")
			tempbook["title"] = titlearray;
			var hollisid = $(items[i]).parseItemJSON("hollisID");
			tempbook["hollisid"] = hollisid;
			var ddate = $(items[i]).parseItemJSON("date");
			tempbook["year"] = ddate;
			var aabstract = $(items[i]).parseItemJSON("abstract");
			tempbook["abstract"] = aabstract;
			var toc = $(items[i]).parseItemJSON("tableOfContents");
			tempbook["toc"] = toc;
			
			displayBook(tempbook, i);
		
		// add this to gbookline
		gbookline.push(tempbook);	
	}
	
	
}
  
function displayBook(bk,i){
	
	// display book in list
	
	var bookdiv = document.createElement("div");
	bookdiv.setAttribute("class","resultdiv");
	bookdiv.setAttribute("id","book" + i);
	var span = document.createElement("span");
	span.setAttribute("class","titlespan");
	$(span).html(bk["title"].join(": "));
	$(bookdiv).append(span);
	var span = document.createElement("span");
	span.setAttribute("class","authorspan");
	$(span).html(bk["author"].join("; "));
	$(bookdiv).append(span);
	bookdiv.setAttribute("onclick","createClickableText('" + i + "')");
	// does it have an abstract or TOC
	if ((bk["toc"] !== undefined) || (bk["abstract"] !== undefined)){
		$(bookdiv).addClass("hastext");
	}
	// append this book to the list
	$("#booklist").append(bookdiv);
	
	
	
}

function fetchTocAbstractMatches(){
	// send the list of selected words to be searched on
	
	// hide the buttonized text
	//$("#markeduptext").slideUp(300);
	
	//  get the listed words
	var words = $(".listedword");
	if (words.length == 0){
		alert("You need to add a least one word. Click on any bold-faced word below.");
			return;
	}
	var wordarray = new Array;
	for (var i=0; i < words.length; i++){
		wordarray.push($(words[i]).text());
	}
	
	var searchwords = JSON.stringify(wordarray);
	$("#loading").show();
		
		$.ajax({
			type: "POST",
			data: {searchwords  : searchwords},
			 url: './php/fetchBooksViaAbstract.php',
			 success: function(r,mode){
					layoutAbstractBooks(r);
					$("#loading").hide();      
				},
			error: function(r,mode){
				$("#loading").hide();
				alert("Oops. Query failed. Click somewhere else.");
			}
	  });
 
	
}

function layoutAbstractBooks(a){
	var results = JSON.parse(a);
	gbookline =[];
	$("#booklist").html("");
	for (var i = 0; i < results.length; i++){
			var result = results[i];
			// for the jquery library, we have to make this an array with one entry and 
			// "mods" key
			var modsified = results[i]; //new Array({"mods" : result});
			var tempbook = new Book(); // to hold each book as created from json
			// use jquery library to get arrays of items we care about
			var subjarray =  $(modsified).parseItemJSON("subject");
			tempbook["subject"] = subjarray;
			var autharray =  $(modsified).parseItemJSON("author");
			tempbook["author"] = autharray;
			var titlearray =  $(modsified).parseItemJSON("title")
			tempbook["title"] = titlearray;
			var hollisid = $(modsified).parseItemJSON("hollisID");
			tempbook["hollisid"] = hollisid;
			var ddate = $(modsified).parseItemJSON("date");
			tempbook["year"] = ddate;
			var aabstract = $(modsified).parseItemJSON("abstract");
			tempbook["abstract"] = aabstract;
			var toc = $(modsified).parseItemJSON("tableOfContents");
			tempbook["toc"] = toc;
			
			displayBook(tempbook, i);
			gbookline.push(tempbook);
	}
}

function toggleButtons(which){
	// manage the buttons that show instructions and about info.
	
	if (which == "explanation"){ // explan is visible, so turn it off
		if ($("#explanation").is(':visible')){
			$('#explanation').slideUp(300);
			//$('#about').slideDown(300);
			$("#instructionsbutton").removeClass("on");
			$("#instructionsbutton").addClass("off");
		}
		else {
			$('#explanation').slideDown(300);
			$('#about').slideUp(300);
			$("#instructionsbutton").addClass("on");
			$("#instructionsbutton").removeClass("off");
			$("#aboutbutton").removeClass("on");
		}
	}
	if (which == "about"){
		if ($("#about").is(':visible')){
			$('#about').slideUp(300);
			//$('#explanation').slideDown(300);
			$("#aboutbutton").removeClass("on").addClass("off");
			//$("#explanationbutton").addClass("on");
		}
		else {
			$('#about').slideDown(300);
			$('#explanation').slideUp(300);
			$("#aboutbutton").removeClass("off").addClass("on");
			$("#instructionsbutton").addClass("off");
		}
	 }
}


function trimdw(s){
  
    var charlist = " '[]{};.,'?$%^&*!+=<>()|\n\\:" + '"'; 
    // trim left
    var done = false;
    var i=0;
    var c = "";
    while (!done){
    	c = s[0];
    	if (charlist.indexOf(c) > -1){
    		s = s.substr(1);
    	}
    	else {
    		done = true;
    	}
    	i++;
    	if (i >= s.length){done = true;}
    }
 
 	// trim right
    
    var done = false;
    var i=s.length - 1;
    if (i <= 0) { return s;}
    var c = "";
    while (!done){
    	c = s[i];
    	if (charlist.indexOf(c) > -1){
    		s = s.substr(0, s.length - 1);
    	}
    	else {
    		done = true;
    	}
    	i--;
    	if (i == 0){done = true;}
    }
    // get rid of internals
    s = s.replace(/[|&;$%@"<>!?'=*{}()+,]/g, "");
  return s;
}
