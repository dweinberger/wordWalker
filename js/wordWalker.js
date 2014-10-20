/* WordWalker
	
	Dual licensed under the MIT license (below) and GPL license.

	MIT License

	Copyright (c) 2014 David Weinberger

	Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.



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

// 		$.ajax({
// 			type: "POST",
// 			
// 			 url: './php/fetchBooksViaAbstractTest3.php',
// 			 success: function(r,mode){
// 					$("#testdiv").html(r);
// 									},
// 			error: function(r,mode){
// 				alert("Oops. Query failed. Click somewhere else.");
// 			}
// 	  });
 


	
	// pressing enter submits the search
	$("#searchbox").keypress(function(e){
		if (e.which === 13){
			startSearch();
			$("#searchbox").blur(); // remove focus
			event.preventDefault();
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

	// make it clickable
// 	$('.realword').unbind('click');
// 	$('.realword').click(function(e){
// 		 e.stopPropagation();
// 		//$(this).addClass("listed");
// 		var id = $(this).attr("id");
// 		addWord(id);
// 		
// 	});
	
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
	// var span = document.createElement("span");
// 	span.setAttribute("class","subjectspan");
// 	$(span).html(bk["subject"].join("; "));
// 	$(bookdiv).append(span);
	// make div clickable
	bookdiv.setAttribute("onclick","createClickableText('" + i + "')");
	// does it have an abstract or TOC
	if ((bk["toc"] !== undefined) || (bk["abstract"] !== undefined)){
		$(bookdiv).addClass("hastext");
		// create button
	// 	var sp = document.createElement("span");
// 		var tx = "";
// 	
// 		sp.setAttribute("onclick","buttonizeText(" + i + ")");
// 		$(sp).html("Abstract");
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
	//You could use JSON.stringify(array) to encode your array in JavaScript, and then use $array=json_decode($_POST['jsondata']); in your PHP script to retrieve it.
	
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


function gotoStacklife(el){
	// el = stacklife button in catcard
	
	// get clicked element
	var clickedbox = document.getElementById(gClickedBox[0] + ":" + gClickedBox[1]);
	var hollisid = $(clickedbox).attr("hollis");
				$.ajax({
					type: "POST",
					data: {hollisid  : hollisid },
					 url: './php/getStacklife.php',
					 success: function(r,mode){
					 		var surl = "http://stacklife.harvard.edu/item/n/" + r;
							 window.open(surl,'StackLife from Boogy');        
						},
					error: function(r,mode){
						
						alert("Unable to launch StackLife.");
					}
			  });
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

var toc1 = "The influence of circumstances by J. B. P. A. Lamarck.--Four evolutionary laws, by J. B. P. A. Lamarck.--An account of a female of the white race of mankind, by W. C. Wells.--Notes on natural selection, by Patrick Matthew.--An attempt to classify varieties of animals, by E. Blyth.--Vestiges of the natural history of creation, by Robert Chambers.--The introduction of new species, by A. R. Wallace.--On species and varieties, by A. R. Wallace and C. Darwin.--Recapitulation and conclusion, by C. Darwin.";

var toc2="Lamarck, Darwin, and the contemporary debate about levels of selection / Gabriel Motzkin -- Jean-Baptiste Lamarck : from myth to history / Pietro Corsi -- Lamarckian problematics in historical perspective / Snait B. Gissis -- Lamarck, Cuvier, and Darwin on animal behavior and acquired characters / Richard W. Burkhardt Jr. -- The golden age of Lamarckism, 1866-1926 / Sander Gliboff -- Germinal selection : a Weismannian solution to Lamarckian problematics / Charlotte Weissman -- The notions of plasticity and heredity among French neo-Lamarckians (1880-1940) : from complementarity to incompatibility / Laurent Loison -- Lamarckism and Lysenkoism revisited / Nils Roll-Hansen -- Lamarckism and the constitution of sociology / Snait B. Gissis -- The exclusion of soft (\"Lamarckian\") inheritance from the modern synthesis / Snait B. Gissis and Eva Jablonka -- Attitudes to soft inheritance in Great Britain, 1930s-1970s / Marion J. Lamb -- The decline of soft inheritance / Scott Gilbert -- \", \"Why did the modern synthesis give short shrift to \"soft inheritance\"? / Adam Wilkins -- The modem synthesis : discussion -- Lamarckian problematics in biology / Eva Jablonka -- Lamarck's dangerous idea / Stuart A. Newman and Ramray Bhat -- Behavior, stress, and evolution in light of the Novosibirsk selection experiments / Arkady L. Markel and Lyudmila N. Trut -- The role of cellular plasticity in the evolution of regulatory novelty / Erez Braun and Lior David -- Evolutionary implications of individual plasticity / Sonia E. Sultan -- Epigenetic variability in a predator-prey system / Sivan Pearl, Amos Oppenheim, and Nathalie Q. Balaban -- Cellular epigenetic inheritance in the twenty-first century / Eva Jablonka -- An evolutionary role for RNA-mediated epigenetic variation? / Minoo Rassoulzadegan -- Maternal and transgenerational influences on human health / Peter D. Gluckman, Mark A. Hanson, and Tatjana Buklijas -- \", \"Plants : individuals or epigenetic cell populations? / Marcello Buiatti -- Instantaneous genetic and epigenetic alterations in the wheat genome caused by allopolyploidization / Moshe Feldman and Avraham A. Levy -- Lamarckian leaps in the microbial world / Jan Sapp -- Symbionts as an epigenetic source of heritable variation / Scott F. Gilbert -- Lamarckian problematics in the philosophy of biology / Snait B. Gissis and Eva Jablonka -- Mind the gaps : why are niche construction models so rarely used? / Ayelet Shayit and James Griesemer -- Our plastic nature / Paul Griffiths -- The relative significance of epigenetic inheritance in evolution : some philosophical considerations / James Griesemer -- The metastable genome : a Lamarckian organ in a Darwinian world? / Ehud Lamm -- Self-organization, self-assembly, and the inherent activity of matter / Evelyn F. Keller -- Ramifications and future directions / Snait B. Gissis and Eva Jablonka -- \",\"Lamarck on the nervous system : past insights and future perspectives / Simona Ginsburg -- Lamarck's \"Pouvoir de la nature\" demystified : a thermodynamic foundation to Lamarck's concept of progressive evolution / Francis Dov Por -- Prokaryotic epigenetic inheritance and its role in evolutionary genetics / Luisa Hirschbein -- Evolution as progressing complexity / Raphael Falk -- Epigenetics and the \"new biology\" : enlisting in the assault on reductionism / Alfred I. Tauber -- Epigenetic inheritance : where does the field stand today? : what do we still need to know? / Adam Wilkins -- Final discussion -- Appendix A. Mandelstam's poem \"Lamarck\" -- Appendix B. Mechanisms of cell heredity.";

var toc3="Machine generated contents note: Part I. Astronomical Background: 1. High energy astrophysics - an introduction; 2. The stars and stellar evolution; 3. The galaxies; 4. Clusters of galaxies; Part II. Physical Processes: 5. Ionisation losses; 6. Radiation of accelerated charged particles and bremsstrahlung of electrons; 7. The dynamics of charged particles in magnetic fields; 8. Synchrotron radiation; 9. Interactions of high energy photons; 10. Nuclear interactions; 11. Aspects of plasma physics and magnetohydrodynamics; Part III. High Energy Astrophysics in our Galaxy: 12. Interstellar gas and magnetic fields; 13. Dead stars; 14. Accretion power in astrophysics; 15. Cosmic rays; 16. The origin of cosmic rays in our galaxy; 17. The acceleration of high energy particles; Part IV. Extragalactic High Energy Astrophysics: 18. Active galaxies; 19. Black holes in the nuclei of galaxies; 20. The vicinity of the black hole; 21. Extragalactic radio sources; 22. Compact extragalactic sources and superluminal motions; 23. Cosmological aspects of high energy astrophysics; Appendix; References; Index.";

var abs1="Providing students with an in-depth account of the astrophysics of high energy phenomena in the Universe, the third edition of this well-established textbook is ideal for advanced undergraduate and beginning graduate courses in high energy astrophysics. Building on the concepts and techniques taught in standard undergraduate courses, this textbook provides the astronomical and astrophysical background for students to explore more advanced topics. Special emphasis is given to the underlying physical principles of high energy astrophysics, helping students understand the essential physics. Now consolidated into a single-volume treatment, the third edition has been completely rewritten. It covers the most recent discoveries in areas such as gamma-ray bursts, ultra-high energy cosmic rays and ultra-high energy gamma rays. The topics have been rearranged and streamlined to make them more applicable to a wide range of different astrophysical problems\"--\",\"\"Providing students with an in-depth account of the astrophysics of high energy phenomena in the Universe, the third edition of this well-established textbook is ideal for advanced undergraduate and beginning graduate courses in high energy astrophysics. Building on the concepts and techniques taught in standard undergraduate courses, this textbook provides the astronomical and astrophysical background for students to explore more advanced topics. Special emphasis is given to the underlying physical principles of high energy astrophysics, helping students understand the essential physics. The third edition has been completely rewritten, consolidating the previous editions into one volume. It covers the most recent discoveries in areas such as gamma-ray bursts, ultra-high energy cosmic rays and ultra-high energy gamma rays. The topics have been rearranged and streamlined to make them more applicable to a wide range of different astrophysical problems\"--\"";

var abs2="Accession 11972 : referee reports for \"Astro-Physical Journal Letters, 1974-1987 (5 cubic feet, 5 record cartons).\",  \"Accession 12986 : Astrophysical Journal letters, editorial records: accepted and rejected manuscripts, 1987-1992 (4 cubic feet, 4 record cartons).\", \"Accession 13316 : Astrophysical Journal Letters, 1990-1995 (5 cubic feet, 5 record cartons).\", \"Accession 13451 : Astrophysical Journal Letters: accepted letters, 1995-1996 (2 cubic feet, 2 record cartons).\", \"Accession 13580 : Astrophysical Journal Letters, 1994-1997 (3 cubic feet, 3 record cartons).\", \"Accession 13682 : articles accepted to parts 1 and 2 of the Astrophysical Journal Letters, 1996-1997 (8 cubic feet, 8 record cartons).\", \"Accession 13771 : Astrophysical Journal Letters: papers submitted and accepted to parts 1&2, 1994-1998 (8 cubic feet, 8 record cartons).\", \"Accession 13890 : Astrophysical Journal Letters/HCO, 1998 (9 cubic feet, 9 record cartons).\", \"Accession 14068 : papers submitted and accepted to parts 1 & 2 of the \"Astrophysical Journal,\" 1998-1999 (10 cubic feet, 10 record cartons).\", \"Accession 14274 : papers accepted to parts 1 and 2 of the Astrophysical Journal, 1999-2000 (7 cubic feet, 7 record cartons).\", \"Accession 14343 : papers accepted to parts 1 & 2 of the Astrophysical Journal, 2000-2001 (13 cubic feet, 13 record cartons).\", \"Accession 14501 : papers accepted to parts 1 & 2 of the Astrophysical Journal; Astrophysical Journal Letters, 2001 (8 cubic feet, 8 record cartons).\", \"Accession 14705 : papers accepted to parts 1 and 2 of the Astrophysical Journal, 2001-2002 (10 cubic feet, 10 record cartons).\", \"Accession 14752 : Records of Astrophysical Journal Letters: editor's files - papers published in ApJL on October 1 and 10, 2002 (Box 1); papers published in ApJL on October 10 and 20, 2001 (Box 2); papers published in ApJL on November 1, 2001 (Box 3); papers published in ApJL on October 20, November 1, and November 10, 2002 (Box 4); papers published in ApJL on November 20 and December 1, 2002 (Box 5); papers published in ApJL on December 10, 2002 (Box 6); papers accepted for publication in ApJL in December, 2002 (Box 6); papers accepted for publication in ApJL, ca. 2001 (Box 7); papers submitted to ApJL, October, November, and December 2002 (Box 8). All papers are accompanied by referee reports, 2000-2002 (8 cubic feet, 8 record cartons). ";   

