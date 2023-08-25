<tr class="{{{cssClass}}}">
	{{#hasSelect}}
    <td><input type="checkbox" rel="check"/></td>
    {{/hasSelect}}
	{{#hasIndex}}
    <td style="text-align:center;">{{{index}}}</td>
	{{/hasIndex}}
    {{#hasAvatar}}
    <td class="avatar"><img src="{{{rootURL}}}{{{avatar}}}{{#hasAvatarURL}}{{{avatarID}}}{{/hasAvatarURL}}"></td>
    {{/hasAvatar}}
    {{#tbody}}
    <td class="{{#isHidden}}hidden{{/isHidden}}" align="{{{align}}}" rel="{{{key}}}" localize>{{{value}}}</td>
    {{/tbody}}
</tr>