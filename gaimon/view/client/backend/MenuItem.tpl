<div class="menuGroup">
    <div class="menuItem" rel="menu">
        <div class="menuDetail">
            {{#isSVG}}
            <div class="menuSVGIcon">
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
    </div>
    <div class="subMenu" rel="subMenu"></div>
</div>
