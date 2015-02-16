# tgchan_QuestPresenter
HTML5/JS/CSS3 Libary to create presentations of tgchan.org's quests

## What does it do?
This Libary consists mainly of a .css-style- and a .js-script-file.
Using this e.g. with the given .html-template helps you to easily create a slideshow in HTML5, so any Browser can view it.
Furthermore it is optimized for tgchan.org's quests. Adding multiple Dialog-Text to a main image-slide, using Icons, styles and transitions and putting in sound-effects, background-music and special content is incredible easy.

## How to use it:
Download Quest_Presenter.css and Quest_Presenter.js and link them into your .html-file e.g. inside the header:

    <link rel="stylesheet" href="res/Quest_Presenter.css">
    <script src="res/Quest_Presenter.js"></script>
    
To insert pages/slides, you add another `<script>`-tag afterwards and either put it into the html-file directly or link to an outide .js file with the following command:
  
    DQ.addpage("url.gif",["text1","text2"],"transition");
    
This will automatically add a new slide with the "url.gif" as image. This slide image will show up 2 times, first with "text1" as Dialog, then with "text2". "transition" describes the animation which is used to show this image-slide.

To show the slides on your page, you need to insert an image- and a text-element. In this example, the following structure was used:

    <div id='image'>
    	<img id='DQimage' src='' alt='Image'/>
    </div>
    <div id='text'>
    	<div id='DQtext'></div>
    	<div onclick='DQ.next("DQimage","DQtext")' id='DQnext'></div>
    	<div onclick='DQ.prev("DQimage","DQtext")' id='DQprev'></div>
    </div>	
    	
The Presentation-size is adapted to the container-height and scales fluently including font-size while respecting aspect-ratios.
As you can see, the next and prev buttons have the attribute `onclick=DQ.next` and `onclick=DQ.prev`. This is the command used to navigate the slides. Additionally you need to provide the ID of the image and text container you want to display the content in.
To start the presentation, simply use 

   DQ.start("DQimage","DQtext");

## What images are supported?
Currently the ".src" attribute is adapted, so mainly all images that are supported by the `<img>` tag.
Planned next is to use "<embed>" to also show flash-files and respective tags to show audio/video content.

##How to change the text-style
Basically there are 2 Methods:
* the text-field support all html-commands, so e.g. using `"<span style='color:red'>red text</span>"` will work.
* Additionally you can use base-styles: "base::red;Red text.;;base::blue;Blue text.;;" will work. To trigger base-styles you need to write `base::name;` to start and ";;" to stop the style. Each basestyle will always use the first unowned ";;" it can find and own it.
* To add your own base-styles, just use following command

    `DQ.styles["red"]=["<span style='color:red;'>","</span>"];`
  
  This will add a style "red" which beginns with `<span style='color:red;'>` and ends with `</span>`.
*There are also insert-elements, which makes formatting easier. These can be inserted using `::name::` e.g.
    `DQ.inserts["par"]=['<br style="display:block;margin:0.2em">'];`
  This inserts a new line with vertical space which is 120% of the text-height and very useful between new paragraphs.


##How to use Icons for Speech
Icons are added similar to the text-style! First you need to define an object, though:

    DQ.icons["name"]="url.gif";

Now you can add the icon at the beginning of each text you show with the command `con::name:left;`:

    DQ.addpage("chapter1.gif",["icon::name:left;I have lived the years of interim alone in a quiet home","easeIn"];

If you use `:left;` the Icon will appear on the left side, `:right;` will show it on the right.
This will also create an additional wrapper around your text which slightly enlargends the text-margin around it.
Please note that you can only use one icon per Text but different Icons within slide with multiple texts.

##How to use transitions:
As mentioned above, you can choose which transition is used on the lest slide whenever you come to this slide. For this you need to call the name of the transition as last argument in `DQ.addpage`. Using an empty string `""` or a not existing transition-name here will result in the slide simply showing up.

To add a new Transition, you need to add a CSS3-Animation to your file:

    <style>
      @keyframes AnimationEaseOut{
        0%    {opacity:1;}
        100%  {opacity:0;}
      }
      .easeOut{		
        animation-name: AnimationEaseOut;
        animation-timing-function: ease-in;
        animation-duration: 0.5s;	
      }
    </style>
  
This will add the style `easeOut`, which will take 0.5s and simply fade the image from `opacity:1` (opaque) to `opacity:0` (transparent) out.
The percentage-numbers regard the animation-time while between them there is a linear-gradient. Adding e.g. 50% {opacity:0.6} here would make the fadeout slower until half of the animation time is reached (0.25s for 1 -> 0.6) and then faster (0.25 s for 0.6 -> 0).
  
##You mentioned a lot of other stuff
This is still an alpha-release, so a lot of stuff is missing (music, effects, additional content).
However, if you want to influence development, please notify me e.g. per PN here or on deviantart (dediggefedde.deviantart.com).
