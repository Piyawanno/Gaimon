<table class="monthlyCalendarTable">
    <thead>
        <tr>
            {{#weekdays}}
            <th class="calendarTh">{{.}}</th>
            {{/weekdays}}
        </tr>
    </thead>
    <tbody rel="tbody">
        {{#days}}
        <tr>
            {{#.}}
            {{#isDisable}}
            <td class="monthlyCell disable"></td>
            {{/isDisable}}
            {{^isDisable}}
            <td class="monthlyCell">
                <div class="monthlyCellDIV">
                    <div class="monthlyCellDate">
                        <div class="monthlyCellDateText {{#isToday}}today{{/isToday}}" rel="date_{{number}}">{{number}}</div>
                    </div>
                    <div class="monthlyCellContent eventCell" rel="event_{{year}}_{{month}}_{{number}}"></div>
                </div>
            </td>
            {{/isDisable}}
            {{/.}}
        </tr>
        {{/days}}
    </tbody>
</table>