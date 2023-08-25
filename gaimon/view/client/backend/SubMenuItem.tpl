<div class="subMenuItem" rel="menu">
    {{#isSVG}}
    <div class="menuSVGIcon flex-column-center">
        {{{icon}}}
    </div>
    {{/isSVG}}
    {{^isSVG}}
    <div class="menuImgIcon">
        <img class="menuImg" src="{{icon}}">
    </div>
    {{/isSVG}}
    <div class="menuLabel" localize>{{name}}</div>
</div>