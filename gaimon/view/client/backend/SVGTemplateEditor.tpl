<div class="svg-template-editor">
    <div class="component-bar" rel="component_bar">
        <div class="component-item" rel="signature_component" draggable="true">
            <div class="label">Signature</div>
            <svg viewBox="0 0 24 24">
                <path d="M22,22H2V20H22V22M6.2,17.3L5.5,18L4.1,16.6L2.7,18L2,17.3L3.4,15.9L2,14.5L2.7,13.8L4.1,15.2L5.5,13.8L6.2,14.5L4.8,15.9L6.2,17.3M16.22,14.43C16.22,13.85 15.5,13.2 14.06,12.46C12.23,11.54 11,10.79 10.36,10.24C9.71,9.68 9.39,9.06 9.39,8.37C9.39,6.59 10.3,5.12 12.12,3.95C13.94,2.78 15.43,2.19 16.57,2.19C17.31,2.19 17.85,2.32 18.18,2.58C18.5,2.83 18.68,3.27 18.68,3.9C18.68,4.18 18.56,4.42 18.31,4.63C18.07,4.83 17.87,4.93 17.74,4.93C17.63,4.93 17.43,4.83 17.13,4.64L16.55,4.38C16.08,4.38 15.14,4.71 13.71,5.38C12.29,6.04 11.58,6.79 11.58,7.63C11.58,8.14 11.82,8.6 12.32,9C12.82,9.42 13.71,9.93 15,10.53C16.03,11 16.86,11.5 17.5,12.07C18.1,12.61 18.41,13.25 18.41,14C18.41,15.34 17.47,16.41 15.58,17.17C13.7,17.94 11.9,18.32 10.19,18.32C8.75,18.32 8,17.83 8,16.86C8,16.5 8.19,16.27 8.5,16.11C8.83,15.95 9.16,15.87 9.5,15.87L10.25,16L10.97,16.13C11.95,16.13 13,15.97 14.13,15.64C15.26,15.32 15.96,14.91 16.22,14.43Z" />
            </svg>
        </div>
        <div class="component-item" rel="text_box_component" draggable="true">
            <div class="label">Text</div>
            <svg viewBox="0 0 24 24">
                <path d="M18.5,4L19.66,8.35L18.7,8.61C18.25,7.74 17.79,6.87 17.26,6.43C16.73,6 16.11,6 15.5,6H13V16.5C13,17 13,17.5 13.33,17.75C13.67,18 14.33,18 15,18V19H9V18C9.67,18 10.33,18 10.67,17.75C11,17.5 11,17 11,16.5V6H8.5C7.89,6 7.27,6 6.74,6.43C6.21,6.87 5.75,7.74 5.3,8.61L4.34,8.35L5.5,4H18.5Z" />
            </svg>
        </div>
    </div>
    <div class="template-container" rel="template_container">
        <div class="svg-template-container" rel="template_page_container"></div>
    </div>
    <div class="property-bar" rel="property_bar">
        <div class="open_template_container">
            <div class="open_template_button" rel="import">Import</div>
            <div class="export_template_button" rel="export">Export</div>
            <input type="file" rel="file_import" accept="image/svg+xml" hidden/>
        </div>
        <div class="property-bar-container">
            <div class="property-bar-item">
                <div>Attribute:</div>
                <div><input class="property-bar-item-input" rel="attribute" type="text" disabled/></div>
            </div>
            <div class="property-bar-item">
                <div>Text:</div>
                <div><input class="property-bar-item-input" rel="text" type="text" disabled/></div>
            </div>
        </div>
    </div>
</div>