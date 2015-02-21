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
			Use html as image
			imageeffects
			
			
	Thoughts:
		
		secondary:
			sounds:
				need delays?
			html as image
				e.g. canvas/animations
				use similar technique as additional Elements
				overlay-div restricted to last image-size or provided size
				addpageElement("htmlName",["texts"],"transition")
			additional elements
				use ressource-Array (=> icons)
				use an icon provided by template to popup when add. el. exists
				clicking triggers display of overlay <div> 80% size
				addHtmlElement("name","HTML");
			credit page
				center, autoscroll, style back/front
				addcredits(["texts"],"backgroundstyle");
			text
				scrollbars for large Texts?
			image effects
				predefined effects: translate(SourceX,SourceY,TargetX,TargetY), Zoom(targetMag), ...
				Necessary? Transitions can do all that:
				on slide access: animate margins?
				well, because transitions play at the end of the last slide to get to this one.
				Effects will target the next frame
				May extend addpage 
			transitions:
				change their point:
				make a effekt at begin, transition at end regarding timeline
			image
				make a overflow:hidden
				
	*/
	var DQ = DQ || {};
	DQ.length=0;
	DQ.index=0;
	DQ.subindex=0;
	DQ.textob=null;DQ.imgob=null;
	DQ.intransition=false;
	DQ.page=[];
	DQ.music=[];
	DQ.nomusic=false;
	DQ.nosound=false;
	DQ.playmusic=function(music,volume,loop,fade){
		DQ.music[DQ.page.length]=[music,volume,loop,fade];
	}
	DQ.addpage=function(img,texts,trans){
		DQ.page[DQ.length]={
			image:img, //image url
			texts:DQ.setstyle(texts), //array of texts
			transition:trans,
		};
		DQ.length++;
	};
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
	DQ.next=function(imgID,textID){	
		DQ.subindex++;
		var startind=DQ.index;
		if(DQ.subindex==DQ.page[DQ.index].texts.length && DQ.index<DQ.length-1){
			DQ.subindex=0;
			DQ.index++;
		}else if(DQ.subindex==DQ.page[DQ.index].texts.length && DQ.index==DQ.length-1){
			DQ.subindex--;
			return;
		}
		
		DQ.showpage(imgID,textID,DQ.index!=startind);
		if(DQ.index!=startind)DQ.preload();
	}
	DQ.prev=function(imgID,textID){	
		DQ.subindex--;
		var startind=DQ.index;
		if(DQ.subindex==-1 && DQ.index>0){
			DQ.index--;
			DQ.subindex=DQ.page[DQ.index].texts.length-1;
		}else if(DQ.subindex==-1 && DQ.index==0){
			DQ.subindex++;
			return;
		}
		
		DQ.showpage(imgID,textID,DQ.index!=startind);
	}
	DQ.start=function(imgID,textID){
		DQ.subindex=0;
		DQ.index=0;
		DQ.showpage(imgID,textID);
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
	DQ.showpage=function(imgID,textID,imgtransition=false,noTextupdate=false){	
		DQ.textob=document.getElementById(textID);
		DQ.imgob=document.getElementById(imgID)
		// console.log(DQ,DQ.intransition);
		if(DQ.page[DQ.index].image.indexOf(".swf")==DQ.page[DQ.index].image.length-4){
			if(DQ.imgob.tagName=="IMG"&&!noTextupdate){
				var el=document.createElement("embed");
				el.width=DQ.imgob.offsetWidth;
				el.height=DQ.imgob.offsetHeight;
				el.id=DQ.imgob.id;
				DQ.imgob.parentNode.insertBefore(el,DQ.imgob);
				DQ.imgob.parentNode.removeChild(DQ.imgob);
				DQ.imgob=el;
			}
		}else{
			if(DQ.imgob.tagName=="EMBED"&&!noTextupdate){
				var el=document.createElement("img");
				el.id=DQ.imgob.id;
				DQ.imgob.parentNode.insertBefore(el,DQ.imgob);
				DQ.imgob.parentNode.removeChild(DQ.imgob);
				DQ.imgob=el;
			}
		}
		
		if(imgtransition&&!DQ.intransition&&DQ.page[DQ.index].transition!=""){
			DQ.intransition=true;
			imgob2=DQ.imgob.cloneNode(true);		
			imgob2.style.position="absolute";
			imgob2.className=DQ.page[DQ.index].transition;
			imgob2.addEventListener('animationend', function() {	
				DQ.intransition=false;
				// var imgID=this.id;
				this.parentNode.removeChild(this);
				// DQ.imgob=document.getElementById(imgID);
				// DQ.imgob.src=DQ.page[DQ.index].image;
				// DQ.showpage(imgID,textID);
			});		
			DQ.imgob.src=DQ.page[DQ.index].image;
			DQ.imgob.parentNode.insertBefore(imgob2,DQ.imgob);
		}else{
			DQ.imgob.src=DQ.page[DQ.index].image;
		}
		
		DQ.imgob.removeEventListener('load', adaptTextobWidth);	
		DQ.imgob.addEventListener('load', adaptTextobWidth);	
		
		console.log(imgtransition,DQ.index,DQ.music,DQ.music[DQ.index]);
		if(!DQ.nomusic&&(imgtransition||DQ.index==0)&&typeof DQ.music[DQ.index]!="undefined"){	
			var addmusic=function(){
				var el=document.getElementById("DQ_intern_Music");
				if(el!=null)el.parentNode.removeChild(el);
				
				el=document.createElement("audio");
				el.autoplay='true';
				el.id="DQ_intern_Music";
				if(DQ.music[DQ.index][2])el.loop="true";
				el.innerHTML="<source src='"+DQ.music[DQ.index][0]+"' type='audio/mpeg'>";
				el.volume=0;//(DQ.music[DQ.index][1]/100.0);
				DQ.imgob.parentNode.appendChild(el);
				var fadeAudioin = setInterval(function () {
					var sound=document.getElementById("DQ_intern_Music");
					if (sound!=null){
						var max=DQ.music[DQ.index][1]/100.0;
						var step=max/(DQ.music[DQ.index][3]*10); //*10 = /100ms
					}
					// console.log(step,max,DQ.music[DQ.index][3]);
					if (sound!=null&&sound.volume < max) {
						if(sound.volume+step>max)sound.volume = max;else
							sound.volume += step;								
					}else {
						clearInterval(fadeAudioin);
					}
				}, 100);
			}
			if(DQ.music[DQ.index][3]>0){		
				var fadeAudioout = setInterval(function () {
					var sound=document.getElementById("DQ_intern_Music");
					if (sound!=null){
						var max=DQ.music[DQ.index][1]/100.0;
						var step=max/(DQ.music[DQ.index][3]*10); //*10 = /100ms
					}
					if (sound!=null&&sound.volume > 0.0) {
						if(sound.volume-step<0)sound.volume = 0;else
							sound.volume -= step;									
					}else {
						clearInterval(fadeAudioout);
						addmusic();
					}
				}, 100);
			}else{
				addmusic();
			}
	
		}
		if(noTextupdate)return
			
		if(DQ.nosound)DQ.textob.innerHTML=DQ.page[DQ.index].texts[DQ.subindex].replace(/<audio.*?audio>/g,"");
		else DQ.textob.innerHTML=DQ.page[DQ.index].texts[DQ.subindex];
		
		adaptTextobWidth();
	};
	function adaptTextobWidth(){
		DQ.textob.parentNode.style.width=(DQ.imgob.offsetWidth)+"px";	
	}
	
/* Animations */
	
	
	
	