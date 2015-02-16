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
			Additional Elementes	
			background music
			sound effects
			
	Thoughts:
		primary:
			use page as index:
				array of images index i
				2d Array of i -> texts index j
				When showing (for i(for j(next();)))
			style texts
				1. Inline within javascript <<-- prefered
				2. list of styles
		secondary
			background-music:
				1. extern object -> start & stop page
				2. page property -> "music.mp3" (remains) & empty (fadeout)
			sound effect:
				page property : "effect.mp3" & delay
	*/
	var DQ = DQ || {};
	DQ.length=0;
	DQ.index=0;
	DQ.subindex=0;
	DQ.intransition=false;
	DQ.page=[];
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
	DQ.setstyle=function(texts){
		for(var i=0;i<texts.length;i++){
			var style;
			console.log(texts,texts.length,i);
			
			var ex=/base::(\w+?);/g;
			while((style = ex.exec(texts[i])) !== null) {
				if(DQ.styles[style[1]]==null)continue;
				texts[i]=texts[i].replace(/base::(\w+?);/,DQ.styles[style[1]][0]);
				texts[i]=texts[i].replace(/;;/,DQ.styles[style[1]][1]);
				//no /g as only the first occurence shall get replaced!
			}
			
			var ex=/::(\w+?)::/g;
			while((style = ex.exec(texts[i])) !== null) {
				if(DQ.inserts[style[1]]==null)continue;
				texts[i]=texts[i].replace(/::(\w+?)::/,DQ.inserts[style[1]][0]);
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
			console.log(e.which);
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
	DQ.showpage=function(imgID,textID,imgtransition){	
		var imgob=document.getElementById(imgID),textob=document.getElementById(textID);
		// console.log(DQ,DQ.intransition);
		if(imgtransition&&!DQ.intransition&&DQ.page[DQ.index].transition!=""){
			DQ.intransition=true;
			var imgob2=imgob.cloneNode(true);		
			imgob2.src=DQ.page[DQ.index].image;
			imgob.style.position="absolute";
			imgob.parentNode.appendChild(imgob2);
			imgob.className=DQ.page[DQ.index].transition;
			imgob.addEventListener('animationend', function() {	
				DQ.intransition=false;
				this.parentNode.removeChild(this);
				DQ.showpage(imgID,textID);
			});		
		}else{
			imgob2=imgob;
			imgob2.src=DQ.page[DQ.index].image;
		}
		
		textob.innerHTML=DQ.page[DQ.index].texts[DQ.subindex];
			
		imgob2.addEventListener('load', function() {		
			textob.parentNode.style.width=(imgob2.offsetWidth)+"px";		
		});
		textob.parentNode.style.width=(imgob2.offsetWidth)+"px";
	};
	
	
/* Animations */
	
	
	
	