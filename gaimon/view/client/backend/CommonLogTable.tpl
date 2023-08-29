<div class="common_log">
    <div class="flex flex-column-responsive space-between gap-10px">
        <div class="flex gap-10px">
            <div class="flex gap-20px">
                <div class="data_header" rel="title" localize>{{{title}}}</div>
            </div>
        </div>
        <div>
            <div class="flex flex-column-responsive gap-5px" rel="button">
                <div class="flex gap-5px hidden" rel="filter">
                    <div>
                        <input class="abstract_input" type="date" rel="startDate">
                    </div>
                    <div class="flex-column-center">-</div>
                    <div>
                        <input class="abstract_input" type="date" rel="endDate">
                    </div>
                </div>
                <div>
                    <select class="abstract_select" style="padding: 0 10px; box-sizing: border-box;" rel="limit">
                        <option value="10">10</option>
                        <option value="50">50</option>
                    </select>
                </div>
                <div class="abstract_button filter_button" rel="search">
                    <svg style="width:24px;height:15px;" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M14,12V19.88C14.04,20.18 13.94,20.5 13.71,20.71C13.32,21.1 12.69,21.1 12.3,20.71L10.29,18.7C10.06,18.47 9.96,18.16 10,17.87V12H9.97L4.21,4.62C3.87,4.19 3.95,3.56 4.38,3.22C4.57,3.08 4.78,3 5,3V3H19V3C19.22,3 19.43,3.08 19.62,3.22C20.05,3.56 20.13,4.19 19.79,4.62L14.03,12H14Z"></path>
                    </svg>
                </div>
            </div>
        </div>
    </div>
    <div class="log_table" rel="log"></div>
</div>