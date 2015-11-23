var COLORS = {
	"BLACK"	: "0.0 0.0 0.0",
	"WHITE"	: "1.0 1.0 1.0",
	"PURPLE": "0.5 0.1 0.7",
	"RED"	: "0.8 0.2 0.2",
	"PINK"	: "0.8 0.1 0.4",
	"BLUE"	: "0.4 0.4 1.0",
	"YELLOW": "1.0 1.0 0.0",
	"GREEN"	: "0.1 0.5 0.1",
	"ORANGE": "0.9 0.5 0.1",
}
var drawingElipses = null;
var dots = 1;

var uploading = false;

function updateTheta(speed)
{
	theta.value = (eval(theta.value) + speed) % 360;				//Increment the slider value wraping around when the top is reached
	theta.onchange();
}

function addLink(bar, numberOfLinks, rotation, dir, offset, type)						//Appends links 1cm long to a given bar until the specified number of links is met
{
	for(var i = bar.childElementCount - bar.getAttribute("permanentChildren"); i < numberOfLinks; i++)
	{
		var s = document.createElement("Inline");								//Create a new tag
		s.setAttribute("url", type);//barPiece.x3d");					//Load a new link
		s.setAttribute("nameSpaceName", " ");									//Set the nameSpaceName so the Material tag can be accessed
		s.onload = function() {													//When a piece is loaded update the color of that bar
			updateColor(bar, bar.getElementsByTagName("Material")[0].getAttribute("DEF"), bar.getElementsByTagName("Material")[0].getAttribute("diffuseColor"));	
		}
		var t = document.createElement("Transform");							//Create a new tag
		trans = "" + (dir * (i + offset)/100).toString() + " 0 0";			//locate the new link
		var rot = "0 1 0 " + rotation.toString()
		t.setAttribute("translation", trans);
		t.setAttribute("rotation", rot);
		var newId = "" + bar.id + "Child" + (i + 1).toString();					//Create a unique id for the new link
		t.setAttribute("id", newId);
		t.appendChild(s);
		bar.appendChild(t);
		//console.log(bar);		//WHAT IS GOING ON WITH THE "Cannot read property 'appendChild' of null"
	}				
}

function removeLink(bar, numberOfLinks)											//Removes links 1cm long from a specified bar until the specified number of links is met
{
	for(var i = bar.childElementCount - bar.getAttribute("permanentChildren"); i > numberOfLinks; i--)
	{
		var getId = "" + bar.id + "Child" + (i).toString();						//Finds the correct link id
		var del = document.getElementById(getId)								//Fetches that link
		bar.removeChild(del);													//Deletes the link
	}
}

function adjustBase(length, vertDist)
{
	scal = "1 1 " + (-1 * vertDist + ADDITIONAL_STAND_HEIGHT).toString();
	document.getElementById("standHeight").setAttribute("scale", scal);

	trans = -(length / 100 + 0.0025).toString() + " 0.0 0.0";
	document.getElementById("rightPost").setAttribute("translation", trans);

	trans = -((length / 2) / 100).toString() + " 0.0 " + ((vertDist - 2.15)/ 100).toString();
	document.getElementById("latice").setAttribute("translation", trans);

	trans = -((length / 2) / 100).toString() + " -0.00125 " + (((vertDist - ADDITIONAL_STAND_HEIGHT - ADDITIONAL_BODY_HEIGHT) / 2) / 100).toString();
	document.getElementById("strongMan").setAttribute("translation", trans);

	scal = "1 1 " + ((-1 * vertDist + ADDITIONAL_BODY_HEIGHT) / 2).toString();
	document.getElementById("longLeg").setAttribute("scale", scal);
	document.getElementById("longArm").setAttribute("scale", scal);

	scal = "1 1 " + ((-1 * vertDist) / 2).toString();
	document.getElementById("shortLeg").setAttribute("scale", scal);
	document.getElementById("shortArm").setAttribute("scale", scal);

	scal = (length / 2).toString() + " 1 1";
	document.getElementById("armsAndLegs").setAttribute("scale", scal);
	document.getElementById("strongManBody").setAttribute("scale", scal);
	
	if(length > 7.5)
	{
		scal = (Math.floor((length + 0.5) / 2) * 2 + 2.5).toString() + " 1 1";
		document.getElementById("standCrossbar").setAttribute("scale", scal);
		adjustHoops(Math.floor((length + 0.5) / 2) - 3);
	}
	else
	{
		document.getElementById("standCrossbar").setAttribute("scale", "8.5 1 1");
		adjustHoops(0);
	}
}

function adjustHoops(hoops)
{
	scal = (((hoops + 1) % 2) * 2 + 6.5).toString() + " 1.0 1.0";
	document.getElementById("standLaticeBrace").setAttribute("scale", scal);

	var quartTrans = "0.0025 " + (((hoops + 1) % 2) / 100).toString() + " 0.0";
	var halfTrans = ((hoops / 100) + 0.0325).toString() + " 0.0 0.0";
	for(var i = 0; i < 4; i++)
	{
		document.getElementById("quad" + (i + 1).toString() + "QuarterCircles").setAttribute("translation", quartTrans);

		document.getElementById("quad" + (i + 1).toString() + "HalfCircles").setAttribute("translation", halfTrans);

		for(var j = 0; j < hoops; j++)
		{
			if(document.getElementById("quad" + (i + 1).toString() + "HalfCircles" + (j + 1).toString()).getAttribute("render") !== "true")
			{
				document.getElementById("quad" + (i + 1).toString() + "HalfCircles" + (j + 1).toString()).setAttribute("render", "true");
			}
		}

		for(var j = hoops; j < 4; j++)
		{
			if(document.getElementById("quad" + (i + 1).toString() + "HalfCircles" + (j + 1).toString()).getAttribute("render") !== "flase")
			{
				document.getElementById("quad" + (i + 1).toString() + "HalfCircles" + (j + 1).toString()).setAttribute("render", "false");
			}
		}
	}
}

function calcBoundingBox()
{
	var volumeBox = document.getElementById("someUniqueId").children[0]._x3domNode.getVolume();

	min[0] = volumeBox.min.x;
	min[1] = volumeBox.min.y;
	min[2] = volumeBox.min.z;

	max[0] = volumeBox.max.x;
	max[1] = volumeBox.max.y;
	max[2] = volumeBox.max.z;
}

function updateCenterOfRotation()
{
	var centerOfRot = "0 0 0";
	var view = document.getElementById("view");

	centerOfRot = ((max[0] + min[0]) / 2).toString() + " " + ((max[1] + min[1]) / 2).toString() + " " + ((max[2] + min[2]) / 2).toString();
	view.setAttribute("centerOfRotation", centerOfRot);
}

function updateColor(section, colorName, newColor)			//Updates the color of the specified section to a given color and name
{
	var objects = section.getElementsByTagName("Material");	//Get all the specified section's material tags
	for (var i = 0; i < objects.length; i++)				//Cycle through the material tags
	{
		if(objects[i].getAttribute("DEF") !== colorName)	//If the color of the piece is not correct
		{
			objects[i].setAttribute("diffuseColor", newColor);	//Recolor the piece
			objects[i].setAttribute("DEF", colorName);			//Update the name
		}
	}
}

function fullColorUpdate(colorName, newColor)				//Updates all bars to the same given color and name
{
	var sections = document.getElementById("x3dRender").children;
	for(var i = 0; i < sections.length - 1; i++)
	{
		updateColor(sections[i], colorName, newColor);
	}
}

function upload(title, type) {

	displayUploading();
	drawingElipses = setInterval(function() {drawElipses()}, 1000);

	uploading = true;

	var materials = {
		"Black"		: 25,
		"White"		: 62,
		"Purple"	: 75,
		"Red"		: 76,
		"Pink"		: 77,
		"Blue"		: 78,
		"Yellow"	: 93,
		"Green"		: 94,
		"Orange"	: 95,
	}

	var doc = document.getElementById("someUniqueId").cloneNode(true);

	var colour = document.getElementById("crank").getElementsByTagName("Material")[0].getAttribute("DEF");
	var materialId = materials[colour];
	if (materialId === null)
	{
		materialId = 6;
	}

	doc = removeNonRenderedPieces(doc);

    var content = doc.innerHTML;
	content = '<\?xml version="1.0" encoding="UTF-8"\?>\n<!DOCTYPE X3D PUBLIC "ISO//Web3D//DTD X3D 3.0//EN" "http://www.web3d.org/specifications/x3d-3.0.dtd">\n<X3D version="3.0" profile="Immersive" xmlns:xsd="http://www.w3.org/2001/XMLSchema-instance" xsd:noNamespaceSchemaLocation="http://www.web3d.org/specifications/x3d-3.0.xsd">\n' + content;
	content = content + '\n</X3D>';
	content = fixModel(content);

	var url = "ModelUpload.php/";
	
	var formData = "title=" + title + "&defaultMaterial=" + materialId + "&description=This " + type + " model was created by printamotion.com on " + currentDate() + "&";
	var i = 0;
	while(i < content.length - 750000)
	{
		formData += 'data' + Math.floor((i + 1) / 750000) + '=' + content.substring(i, i + 750000) + '&';
		i += 750000;
	}
	formData += 'data' + Math.floor((i + 1)/ 750000) + '=' + content.substring(i,content.length);

	$.ajax({
		url : url,
		type: "POST",
		data : formData,
		success: function(data, textStatus, jqXHR)
		{
			if(uploading)
			{
				var response = $.parseJSON(data);
				var productUrl = response["urls"]["publicProductUrl"]["address"];
				document.getElementById("goToModel").setAttribute("href", productUrl);
				checkingModel = setInterval(function() {checkUpload(response["modelId"], productUrl)}, 5000);//*/
				displayProcessing();
			}
		},
		error: function (jqXHR, textStatus, errorThrown)
		{
			uploading = false;
			alert(errorThrown);
			document.getElementById("overlay").style.visibility = "hidden";
		}
	});
}

function checkUpload(modelId, link) {

	var url = "ModelGet.php/";

	var formData = "modelId=" + modelId.toString();

	$.ajax({
		url : url,
		type: "POST",
		data : formData,
		success: function(data, textStatus, jqXHR)
		{
			var response = $.parseJSON(data);
			if(response["printable"] !== "processing")
			{
				window.clearInterval(checkingModel);
				window.clearInterval(drawingElipses);
				uploading = false;
				if (response["printable"] === "yes")
				{
					setTimeout(function() {displayReady()}, 2500);
				}
				else if(response["printable"] === "no")
				{
					alert("there was a problem with your upload");
				}
			}
		},
		error: function (jqXHR, textStatus, errorThrown)
		{
			uploading = false;
			window.clearInterval(checkingModel);
			window.clearInterval(drawingElipses);
			alert(errorThrown);
		}
	});
}

function currentDate()
{
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1; //January is 0!
	var yyyy = today.getFullYear();

	if(dd<10) {
	    dd='0'+dd
	} 

	if(mm<10) {
	    mm='0'+mm
	} 

	return mm+'/'+dd+'/'+yyyy;
}
function drawElipses()
{
	dots = (dots % 5) + 1;
	var elipses = ".";
	for(i = 1; i < dots; i ++)
	{
		elipses += " .";
	}
	
	document.getElementById("overlayText").getElementsByTagName("p")[3].innerHTML = elipses;
}

function displayUploading()
{
	document.getElementById("overlay").style.visibility = "visible";
	setTimeout(function() {$('#overlay').fadeTo(500, 1.0)}, 100);
}

function displayProcessing()
{
	document.getElementById("overlayText").getElementsByTagName("p")[1].innerHTML = "Shapeways is processing your model";
	document.getElementById("overlayText").getElementsByTagName("p")[2].innerHTML = "This could take a few minutes";
	document.getElementById("goToModel").style.visibility = "visible";
	document.getElementById("backToEditing").innerHTML = "Return to Editing";
}

function displayReady()
{
	document.getElementById("overlay").style.cursor = "auto";
	document.getElementById("overlayText").getElementsByTagName("p")[0].innerHTML = "Your model is ready";
	document.getElementById("overlayText").getElementsByTagName("p")[1].innerHTML = "";
	document.getElementById("overlayText").getElementsByTagName("P")[2].innerHTML = "";
	document.getElementById("overlayText").getElementsByTagName("P")[3].innerHTML = "";
}

function goBackToEditing()
{
	uploading = false;
	window.clearInterval(checkingModel);
	window.clearInterval(drawingElipses);
	$('#overlay').fadeTo(500, 0.0);
	setTimeout(function() {resetOverlay()}, 500);
}

function resetOverlay()
{
	document.getElementById("overlay").style.visibility = "hidden";
	document.getElementById("overlay").style.cursor = "wait";
	document.getElementById("overlayText").getElementsByTagName("p")[0].innerHTML = "Please wait";
	document.getElementById("overlayText").getElementsByTagName("P")[1].innerHTML = "";
	document.getElementById("overlayText").getElementsByTagName("p")[2].innerHTML = "Uploading your model to Shapeways";
	document.getElementById("overlayText").getElementsByTagName("P")[3].innerHTML = ". . . . .";
	document.getElementById("goToModel").style.visibility = "hidden";
	document.getElementById("backToEditing").innerHTML = "Cancel Upload";
}

function removeNonRenderedPieces(doc)
{
	var transforms = doc.getElementsByTagName("Transform");
	var i = 0;
	while (i < transforms.length)
	{
		if(transforms[i].getAttribute("render") === "false")
		{
			transforms[i].parentNode.removeChild(transforms[i]);
		}
		else
		{
			i++;
		}
	}
	return doc;
}
function fixModel(content)
{
	var subs = {
		"\""					: /&quot;/gi,
		"Scene"					: /scene/gi,
		"NavigationInfo"		: /navigationinfo/gi,
		"Background"			: /background/gi,
		"Transform"				: /transform/gi,
		"Inline"				: /inline/gi,
		"'\"EXAMINE\" \"ANY\"'"	: /\"\"EXAMINE\" \"ANY\"\"/gi,
		"avatarSize"			: /avatarsize/gi,
		"transitionTime"		: /transitiontime/gi,
		"transitionType"		: /transitiontype/gi,
		"DEF"					: /def/gi,
		"groundColor"			: /groundcolor/gi,
		"skyColor"				: /skycolor/gi,
		"bboxCenter"			: /bboxcenter/gi,
		"bboxSize"				: /bboxsize/gi,
		"Viewpoint"				: /viewpoint/gi,
		"Group"					: /group/gi,
		"Shape"					: /shape/gi,
		"Appearance"			: /appearance/gi,
		"Material"				: /material/gi,
		"IndexedFaceSet"		: /indexedfaceset/gi,
		"Coordinate"			: /coordinate/gi,
		"</X3D>"				: /<canvas[\s\S]*<\/X3D>/gi,
	}

	var rems = [
		/ typeparams=\"[^\"]*?\"/gi,
		/ explorationmode=\"[^\"]*?\"/gi,
		/ render=\"[^\"]*?\"/gi,
		/ id=\"[^\"]*?\"/gi,
		/ namespacename=\"[^\"]*?\"/gi,
		/ scaleorientation=\"[^\"]*?\"/gi,
		/ ispickable=\"[^\"]*?\"/gi,
		/ sorttype=\"[^\"]*?\"/gi,
		/ usegeocache=\"[^\"]*?\"/gi,
		/ lit=\"[^\"]*?\"/gi,
		/ normalupdatemode=\"[^\"]*?\"/gi,
		/ permanentchildren=\"[^\"]*?\"/gi,
		/<inline[\s\S]*?<\/Background>/gi,
		/<\/inline[\s\S]*?>/gi,
		/<viewpoint[\s\S]*?<\/viewpoint/gi,
	]

	for(var str in subs)
	{
		content = content.replace(subs[str], str);
	}

	for (var str in rems)
	{
		content = content.replace(rems[str], "");
	}

	return content;
}


function checkCP(CP)
{
	if(Math.abs(CP - 3) < (1 / 3))
	{
		if(document.getElementById("couplerBarPost").getAttribute("render") !== "false")
		{
			document.getElementById("couplerBarPost").setAttribute("render", "false");
		}
	}
	else if(document.getElementById("couplerBarPost").getAttribute("render") !== "true")
	{
		document.getElementById("couplerBarPost").setAttribute("render", "true");
	}
}