/*global define*/

define(function (require, exports, module) {
    "use strict";
    var Model = [
        {
            collection_name:
                {
                    'EN': ' Semicírculos',
                    'PT': ' Semicírculos'
                },
            description:
                {
                    'EN': '',
                    'PT': ' Pattern repeat [2x2]'
                },
            pattern1: [[{rot: '1'}, {rot: '1'}], [{rot: '1'}, {rot: '1'}]],
            pattern2: [[{rot: '0'}, {rot: '0'}], [{rot: '0'}, {rot: '0'}]],
            pattern3: [[{rot: '1'}, {rot: '1'}], [{rot: '1'}, {rot: '1'}]],
            imgUrl: 'img/halfCircle.svg'
        },
        
        {
            collection_name:
                {
                    'EN': ' Semicírculos - Composition I',
                    'PT': ' Semicírculos - Composition I'
                },
            description:
                {
                    'EN': '',
                    'PT': ' Pattern repeat [4x4]'
                },
            pattern1: [[{rot: '1'}, {rot: '1'}], [{rot: '1'}, {rot: '1'}]],
            pattern2: [[{rot: '0'}, {rot: '0'}], [{rot: '0'}, {rot: '0'}]],
            pattern3: [[{rot: '1'}, {rot: '1'}], [{rot: '1'}, {rot: '1'}]],
            imgUrl: 'img/halfCircleComp1.svg'
        },
        
        
        {
            collection_name:
                {
                    'EN': ' Morphogenesis',
                    'PT': ' Morphogenesis'
                },
            description:
                {
                    'EN': '',
                    'PT': ' Pattern repeat&#160;&#160;Left [2x2]&#160;&#160;Middle [4x4]&#160;&#160;Right [2x2]'
                },
            pattern1: [[{rot: '1'}, {rot: '1'}], [{rot: '1'}, {rot: '1'}]],
            pattern2: [[{rot: '0'}, {rot: '0'}], [{rot: '0'}, {rot: '0'}]],
            pattern3: [[{rot: '1'}, {rot: '1'}], [{rot: '1'}, {rot: '1'}]],
            imgUrl: 'img/linhasCurvas.svg'
        },
        
        {
            collection_name:
                {
                    'EN': ' Glimpse',
                    'PT': ' Glimpse'
                },
            description:
                {
                    'EN': '',
                    'PT': ' Pattern repeat [2x2]'
                },
            pattern1: [[{rot: '1'}, {rot: '1'}], [{rot: '1'}, {rot: '1'}]],
            pattern2: [[{rot: '0'}, {rot: '0'}], [{rot: '0'}, {rot: '0'}]],
            pattern3: [[{rot: '1'}, {rot: '1'}], [{rot: '1'}, {rot: '1'}]],
            imgUrl: 'img/squareGlimpse.svg'
        }
    ];
    
    module.exports = Model;
});
