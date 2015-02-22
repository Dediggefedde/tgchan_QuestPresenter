/*	
	Needed: 
		defined:
			page:=image;
		primary:
			list of images                  x
			list of texts                   x
			allocation texts to images      x
		secondary:
			Transition of pages				x
			Transition of texts				x
			Icons                           x
			Additional elements	page
			background music                x
			sound effects                   x
			credit page
			Use html as image               x
			imageeffects                    x
			table of content
			
	Thoughts:
		
		secondary:
			template:
				top-menu on hover: mute music, mute sound, show toc
			sounds:
				need delays?
			additional elements
				use ressource-Array (=> icons)
				use an icon provided by template to popup when add. el. exists
				clicking triggers display of overlay
				Needs vertical scrollbar.
				2 types of overlay: text/img simple OR HTML
				text/img simple:
					["text1","text2","::icon:img1;"]
					or [["text1","left"],["text1","right"],["::icon:img1;","left"]]
					get's wrapped in <div> each, position relative, left/right:~0
					background-color/ sets in template.css (=img-size, color: transparent grey)
				HTML
					as html-image, this needs an outside file.
					as html-image, script-tags need to get extracted.				
			credit page
				center, autoscroll, style back/front
				addcredits(["texts"],"backgroundstyle");	
			icons:
				additional parameter for size inside overlays
			fitsize:
				embed and html doesn't scale 
	*/
	var DQ = DQ || {};
	DQ.length=0;
	DQ.index=0;
	DQ.subindex=0;
	DQ.textob=null;DQ.imgob=null;DQ.musicObj=null;
	DQ.intransition=false;
	DQ.page=[];
	DQ.music=[];
	DQ.nomusic=false;
	DQ.nosound=false;
	DQ.playMusic=function(music,volume,loop,fade){
		DQ.music[DQ.page.length]=[music,volume,loop,fade];
	}
	DQ.addPage=function(img,texts,eff,trans){ // => array of imgs-urls, not loaded in cache here
		DQ.page[DQ.length]={
			image:img, //image url
			texts:DQ.setstyle(texts), //array of texts
			effect:eff,
			transition:trans,
			html:false,
			scripts:null,
		};
		DQ.length++;
	};
	DQ.addHtmlPage=function(htm,texts,eff,trans){ //=> array of html-code inserted into a div-element. html files are loaded here, their content (e.g. img tags) not.
		var zwiindex=DQ.length
		setTimeout(function(){ //synchron request not in main thread
			xmlHttp = new XMLHttpRequest();
			xmlHttp.open( "GET", htm, false );
			xmlHttp.setRequestHeader ("Accept", "text/plain");
			xmlHttp.send( null );
			var data =xmlHttp.responseText;
			var ex=/<script[\s\S]*?>([\s\S]*?)<\/script>/gi;
			var row=null;
			var script=[];
			while((row=ex.exec(data))!==null)
				script.push(row[1]);
			
			data=data.replace(ex,"");
			DQ.page[zwiindex]={
				image:data, //html text
				texts:DQ.setstyle(texts), //array of texts
				effect:eff,
				transition:trans,
				html:true,
				scripts:script,
			};
		},0);
		DQ.length++;
	}
	DQ.styles={
		"red":["<span style='color:red'>","</span>"],
		"blue":["<span style='color:blue'>","</span>"],
		"green":["<span style='color:green'>","</span>"],
	};
	DQ.inserts={
		"par":['<br style="display:block;margin:0.2em">'],	
	};	
	DQ.icons={};
	DQ.sounds={};
	DQ.setstyle=function(texts){
		for(var i=0;i<texts.length;i++){
			var style;
			// console.log(texts,texts.length,i);
			
			var ex=/::base:(\w+?);/g;
			while((style = ex.exec(texts[i])) !== null) {
				if(DQ.styles[style[1]]==null)continue;
				texts[i]=texts[i].replace(/::base:(\w+?);/,DQ.styles[style[1]][0]);
				texts[i]=texts[i].replace(/;;/,DQ.styles[style[1]][1]);
				//no /g as only the first occurence shall get replaced!
			}
			
			var ex=/::(\w+?)::/g;
			while((style = ex.exec(texts[i])) !== null) {
				if(DQ.inserts[style[1]]==null)continue;
				texts[i]=texts[i].replace(/::(\w+?)::/,DQ.inserts[style[1]]);
			}
			
			var ex=/^icon::(\w+?):(\w+?);/g;
			while((style = ex.exec(texts[i])) !== null) {
				if(DQ.icons[style[1]]==null)continue;
				if(style[2]=="left"){
					texts[i]=texts[i].replace(/^icon::(\w+?):(\w+?);(.*)$/,"<img id='DQ_intern_Icon' src='"+DQ.icons[style[1]]+"' alt='icon'/><div id='DQ_intern_Text'>$3</div>");
				}else{
					texts[i]=texts[i].replace(/^icon::(\w+?):(\w+?);(.*)$/,"<div id='DQ_intern_Text'>$3</div><img id='DQ_intern_Icon' src='"+DQ.icons[style[1]]+"' alt='icon'/>");
				
				}
			}
			var ex=/::sound:(\w+?);/g;
			while((style = ex.exec(texts[i])) !== null) {
				if(DQ.sounds[style[1]]==null)continue;
				texts[i]=texts[i].replace(/::sound:(\w+?);/,"<audio autoplay><source src='"+DQ.sounds[style[1]]+"' type='audio/mpeg'>["+style[1]+"]</audio>");
				//no /g as only the first occurence shall get replaced!
			}
			
		}
		return texts;
	};
	DQ.next=function(){	
		DQ.subindex++;
		var startind=DQ.index;
		if(DQ.subindex==DQ.page[DQ.index].texts.length && DQ.index<DQ.length-1){
			DQ.subindex=0;
			DQ.index++;
		}else if(DQ.subindex==DQ.page[DQ.index].texts.length && DQ.index==DQ.length-1){
			DQ.subindex--;
			return;
		}
		
		DQ.showpage(startind);
		if(DQ.index!=startind)DQ.preload();
	}
	DQ.prev=function(){	
		DQ.subindex--;
		var startind=DQ.index;
		if(DQ.subindex==-1 && DQ.index>0){
			DQ.index--;
			DQ.subindex=DQ.page[DQ.index].texts.length-1;
		}else if(DQ.subindex==-1 && DQ.index==0){
			DQ.subindex++;
			return;
		}
		
		DQ.showpage(startind);
	}
	DQ.start=function(imgID,textID){
		DQ.subindex=0;
		DQ.index=0;
		DQ.textob=document.getElementById(textID);
		DQ.imgob=document.getElementById(imgID)
		DQ.showpage(-1);
		DQ.preload();
		document.addEventListener("keydown",function(e){
			// console.log(e.which);
			switch(e.which){
			case 39:
			case 32:
				DQ.next(imgID,textID);break;
			case 37:
				DQ.prev(imgID,textID);break;
			}
		},false);
		// document.getElementById(imgID).className="easeIn";
	};
	DQ.preload=function(){
		if(DQ.index==DQ.length-1)return;
		var img= new Image();
		img.src=DQ.page[DQ.index+1].image;
	}
	DQ.fitsize=function(){		
		DQ.textob.parentNode.style.width=(DQ.imgob.offsetWidth)+"px";
	}
	DQ.addmusic=function(){
		var el=document.getElementById("DQ_intern_Music");
		if(el!=null)el.parentNode.removeChild(el);
		
		//temporary audio element
		//nice effect: using "" will stop music, coming back will restart it
		
		el=document.createElement("audio"); //no "controls", always "autoplay", optionally "loop"
		el.autoplay='true';
		el.id="DQ_intern_Music";
		if(DQ.music[DQ.index][2])el.loop="true";
		el.innerHTML="<source src='"+DQ.music[DQ.index][0]+"' type='audio/mpeg'>"; //only mpeg at the moment
		el.volume=0;//silent for fading in
		DQ.musicObj=el;
		DQ.imgob.parentNode.appendChild(el);  //add music -> start it
		
		// fade in transition
		var fadeAudioin = setInterval(function () {
			if (DQ.musicObj!=null){
				var max=DQ.music[DQ.index][1]/100.0; //scale volume 0 -> 1. DQ.music[DQ.index][1]: 0 -> 100
				var step=max/(DQ.music[DQ.index][3]*10); //reach max in [3] s within 100ms steps
			}
			
			if (DQ.musicObj!=null&&DQ.musicObj.volume < max) { //cap at max
				if(DQ.musicObj.volume+step>max)DQ.musicObj.volume = max;else //cap at max
					DQ.musicObj.volume += step; //increase volume fluently
			}else {
				clearInterval(fadeAudioin); //on reaching max-volume, stop fading
			}
		}, 100);
	}
	DQ.showpage=function(oldIndex){	
		// console.log(oldIndex,DQ.index);
		if(DQ.index!=oldIndex){ //img update 
		
			if(DQ.page[DQ.index].html){ //html pages
				var el=document.createElement("div");
				el.style.width=DQ.imgob.offsetWidth+"px";
				el.style.height=DQ.imgob.offsetHeight+"px";
				el.style.display="inline-block";
				el.style.overflow="hidden";
				el.id=DQ.imgob.id;
				DQ.imgob.parentNode.insertBefore(el,DQ.imgob);
				DQ.imgob.parentNode.removeChild(DQ.imgob);
				DQ.imgob=el;
			}else if(DQ.page[DQ.index].image.indexOf(".swf")==DQ.page[DQ.index].image.length-4&&DQ.imgob.tagName!="EMBED"){	
				//on .swf use embed, elsewise img tags
				var el=document.createElement("embed");
				el.style.width=DQ.imgob.offsetWidth+"px";
				el.style.height=DQ.imgob.offsetHeight+"px";
				el.id=DQ.imgob.id;
				DQ.imgob.parentNode.insertBefore(el,DQ.imgob);
				DQ.imgob.parentNode.removeChild(DQ.imgob);
				DQ.imgob=el;
			}else if(DQ.page[DQ.index].image.indexOf(".swf")!=DQ.page[DQ.index].image.length-4&&DQ.imgob.tagName!="IMG"){
				var el=document.createElement("img");
				el.id=DQ.imgob.id;
				DQ.imgob.parentNode.insertBefore(el,DQ.imgob);
				DQ.imgob.parentNode.removeChild(DQ.imgob);
				DQ.imgob=el;
			}
		
			//fading animation of previous slide. 
			//DQ.intransition allows skipping slides with multiple clicks without having to wait for animation
			//transition="" will also skip right ahead
			//oldIndex==-1 means start
			//algorithm: use a second same image which animate-fades while the original already has the next image
			//TODO: showing-up animation of current slide: 
			// console.log(oldIndex,DQ.intransition,DQ.imgob);
			DQ.imgob.className="";			
			if(oldIndex!=-1&&!DQ.intransition&&DQ.page[oldIndex].transition!=""){
				DQ.intransition=true;
				imgob2=DQ.imgob.cloneNode(true);		
				imgob2.style.position="absolute";
				imgob2.className=DQ.page[oldIndex].transition;
				imgob2.addEventListener('animationend', function() {	
					DQ.intransition=false;
					this.parentNode.removeChild(this);
					// start animation here
					// console.log(DQ.page[DQ.index].effect);
					if(DQ.page[DQ.index].effect!=""){//animation for showing up.
						DQ.imgob.style.animationPlayState  = "running"; //start animation
						// DQ.imgob.style.visibility="hidden" //show again and remove CSS visibility attributes
						// DQ.imgob.className=DQ.page[DQ.index].effect; //effect CSS animation
					}
				});		
				//TODO: src=image only when no start animation or else fragment between transitions
				if(!DQ.page[DQ.index].html)DQ.imgob.src=DQ.page[DQ.index].image; //load new image
				else DQ.imgob.innerHTML=DQ.page[DQ.index].image; //load new HTML page
				
				if(DQ.page[DQ.index].effect!=""){//prepare animation for showing up.
					// DQ.imgob.style.visibility="hidden"; //hide new img but reserve display-space
					DQ.imgob.className="";
					setTimeout(function(){
						DQ.imgob.style.animationPlayState = "paused"; //hold animation at 0%.
						DQ.imgob.className=DQ.page[DQ.index].effect; //effect CSS animation
					},0);					
				}
				DQ.imgob.parentNode.insertBefore(imgob2,DQ.imgob);
			}else{ //no end-animation	
				if(DQ.page[DQ.index].effect!=""){ //animation for showing up.
					DQ.imgob.className="";
					setTimeout(function(){
						// DQ.imgob.style.animationPlayState = "paused"; //hold animation at 0%.
						DQ.imgob.className=DQ.page[DQ.index].effect; //effect CSS animation
					},0);
				}
				
				if(!DQ.page[DQ.index].html)DQ.imgob.src=DQ.page[DQ.index].image; //load new image
				else DQ.imgob.innerHTML=DQ.page[DQ.index].image; //load new HTML page
						
			}
			if(DQ.page[DQ.index].scripts!=null){
				for(var i=0;i<DQ.page[DQ.index].scripts.length;i++){
					var s=document.createElement("script");
					s.innerHTML=DQ.page[DQ.index].scripts[i];
					document.body.appendChild(s);
					document.body.removeChild(s);
				}
			}
			
			//adapt textsize to imgsize when img loaded
			DQ.imgob.removeEventListener('load', DQ.fitsize);	
			DQ.imgob.addEventListener('load', DQ.fitsize);	
		}
		
		//Text change // when there is no img-change and showpage is called, it's only textchange
		
		//music
		if(!DQ.nomusic&&typeof DQ.music[DQ.index]!="undefined"){ //add no music when silent, leave old music when no new one
			if(oldIndex>0&&DQ.music[oldIndex][3]>0){ //fadeout old music. would also work on [3]=0=fade-time, but is OP then 		
				var fadeAudioout = setInterval(function () { //see fadein addmusic in for comments
					var sound=document.getElementById("DQ_intern_Music");
					if (sound!=null){
						var max=DQ.music[oldIndex][1]/100.0;
						var step=max/(DQ.music[oldIndex][3]*10); //*10 = /100ms
					}
					if (sound!=null&&sound.volume > 0.0) {
						if(sound.volume-step<0)sound.volume = 0;else
							sound.volume -= step;									
					}else {
						clearInterval(fadeAudioout); //start new music after fading out complete
						DQ.addmusic();
					}
				}, 100);
			}else{
				DQ.addmusic(); //fade in new music 
			}
		}
		
		//sound effects and text content change
		if(DQ.nosound)DQ.textob.innerHTML=DQ.page[DQ.index].texts[DQ.subindex].replace(/<audio.*?audio>/g,"");
		else DQ.textob.innerHTML=DQ.page[DQ.index].texts[DQ.subindex];
		
		//adapt text to img-size.
		DQ.fitsize();
	};