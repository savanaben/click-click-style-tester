
document.addEventListener('DOMContentLoaded', function() {
    setupSVGDropZone('svg-drop-zone-1x', false);
    setupSVGDropZone('svg-drop-zone-2x', true);

    document.querySelectorAll('[data-component="Draggable"]').forEach(item => {
        item.addEventListener('click', toggleDraggableSelection);
        item.addEventListener('dragstart', dragStart);
        item.addEventListener('dragend', dragEnd);
    });

    document.querySelectorAll('.target').forEach(target => {
        target.addEventListener('dragover', dragOver);
        target.addEventListener('dragleave', dragLeave);
        target.addEventListener('drop', drop);
        target.addEventListener('focus', targetFocus); // Add focus event listener
        target.addEventListener('blur', targetBlur); // Add blur event listener
    });


// Global focusin event listener
document.addEventListener('focusin', function(event) {
    const currentSet = event.target.closest('.drag-drop-set');
    if (currentSet) {
        const focusableElements = currentSet.querySelectorAll('.target-highlighted, .draggable-highlighted, [data-component="Draggable"][data-selected="true"]');
        if (!Array.from(focusableElements).includes(event.target)) {
            resetSelectionAndHighlight();
        }
    } else {
        resetSelectionAndHighlight();
    }
});



    setupKeyboardNavigation();

});


function targetFocus(event) {
    event.target.classList.add('target-dragged-over');
}

function targetBlur(event) {
    event.target.classList.remove('target-dragged-over');
}






// Global configuration for class names based on the current style set
let classConfig = {
    draggable: "draggable",
    draggableSelected: "draggable-selected",
    draggableHighlighted: "draggable-highlighted",
    targetHighlighted: "target-highlighted",
    targetDraggedOver: "target-dragged-over",
    draggableHighlightedHover: "draggable-highlighted-hover",
    target: "target",
    draggableFaded: "draggable-faded",
    fadingEnabled: false, // Toggle for enabling/disabling the faded class application
    borderWeightReduced: false // New flag to track border weight toggle state


};

// Configuration of all base classes involved in style switching
const baseClasses = ['draggable', 'draggable-selected', 'draggable-highlighted', 'target-highlighted', 'target-dragged-over', 'draggable-highlighted-hover','target','draggable-faded'];

// Function to switch style sets or revert to the default style
function switchStyleSet(styleSetName, button) {
    baseClasses.forEach(baseClass => {
        // Select all elements by base class without any suffix
        document.querySelectorAll(`.${baseClass}, .${baseClass}-set1, .${baseClass}-set2, .${baseClass}-set3`).forEach(el => {
            // Remove current style class with any suffix
            el.classList.remove(`${baseClass}-set1`, `${baseClass}-set2`, `${baseClass}-set3`);
            if (styleSetName) {
                // Add new style class with the specified set suffix
                el.classList.add(`${baseClass}-${styleSetName}`);
            } else {
                // Ensure the base class is properly set when removing suffixes
                el.classList.add(baseClass);
            }
        });
    });

    // Update the global class configuration to reflect the current style set
    updateClassConfig(styleSetName);

    // Remove active class from all buttons
    document.querySelectorAll('.styleSetsButtons button').forEach(btn => {
        btn.classList.remove('active');
    });

    // Add active class to the clicked button
    if (button) { // Ensure button is passed and defined
        button.classList.add('active');
    }
}


// Update the global class configuration object to the current style set
function updateClassConfig(styleSet) {
    // If a style set is specified, update each class to include the set suffix
    if (styleSet) {
        classConfig.draggable = `draggable-${styleSet}`;
        classConfig.draggableSelected = `draggable-selected-${styleSet}`;
        classConfig.draggableHighlighted = `draggable-highlighted-${styleSet}`;
        classConfig.targetHighlighted = `target-highlighted-${styleSet}`;
        classConfig.targetDraggedOver = `target-dragged-over-${styleSet}`;
        classConfig.draggableHighlightedHover = `draggable-highlighted-hover-${styleSet}`;

    } else {
        // Reset class configuration to default without any suffixes
        classConfig.draggable = 'draggable';
        classConfig.draggableSelected = 'draggable-selected';
        classConfig.draggableHighlighted = 'draggable-highlighted';
        classConfig.targetHighlighted = 'target-highlighted';
        classConfig.targetDraggedOver = 'target-dragged-over';
        classConfig.draggableHighlightedHover = 'draggable-highlighted-hover';

    }
    console.log("Class configuration updated:", classConfig);
}

function toggleFadingFeature() {
    classConfig.fadingEnabled = !classConfig.fadingEnabled;
    console.log("Fading feature is now " + (classConfig.fadingEnabled ? "enabled" : "disabled"));
}

function toggleBorderWeightFeature(isEnabled) {
    classConfig.borderWeightReduced = isEnabled; // Update the config based on the toggle state
    const elementsToAdjust = document.querySelectorAll('.target'); // Adjust selector as needed

    elementsToAdjust.forEach(el => {
        if (isEnabled) {
            el.classList.add('border-weight-reduced');
        } else {
            el.classList.remove('border-weight-reduced');
        }
    });
}






function updateTargetsTabindex(tabindexValue, draggableElement = null) {
    let targets;
    if (draggableElement) {
        // If draggableElement is provided, update tabindex only for targets in the same set
        const dragDropSet = draggableElement.closest('.drag-drop-set');
        targets = dragDropSet.querySelectorAll('.target');
    } else {
        // If no draggableElement is provided, select all targets
        targets = document.querySelectorAll('.target');
    }
    targets.forEach(target => {
        target.tabIndex = tabindexValue;
    });
}

// Call updateTargetsTabindex with -1 initially to ensure targets are not tabbable by default
document.addEventListener('DOMContentLoaded', () => {
    updateTargetsTabindex(-1);
});


function setupKeyboardNavigation() {
    document.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            let selectedDraggable = document.querySelector('[data-component="Draggable"][data-selected="true"]');
            if (selectedDraggable) {
                handleArrowNavigation(event, selectedDraggable);
            }
        }
    });
}




function handleArrowNavigation(event) {
    const activeElement = document.activeElement;
    // Find the closest .drag-drop-set container to the currently focused element
    const currentSet = activeElement.closest('.drag-drop-set');
    if (!currentSet) return; // Exit if no parent container matches

    // Selecting elements within the current .drag-drop-set container that are highlighted or the active element itself
    // Include DropZone with 'target-highlighted' class in the navigation
    const elements = Array.from(currentSet.querySelectorAll('.target-highlighted, .draggable-highlighted, [data-component="Draggable"][data-selected="true"], [data-component="DropZone"].target-highlighted'));
    const focusedIndex = elements.indexOf(activeElement);

    let nextIndex = focusedIndex; // Default to the current index if no navigation key is pressed
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        // Move focus to the previous item or wrap around to the last item
        nextIndex = focusedIndex - 1 < 0 ? elements.length - 1 : focusedIndex - 1;
    } else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        // Move focus to the next item or wrap around to the first item
        nextIndex = (focusedIndex + 1) % elements.length;
    }

    // Safely attempt to focus the next element in the sequence
    if (elements[nextIndex]) {
        event.preventDefault(); // Prevent default arrow key behavior (scrolling)
        elements[nextIndex].focus();
    }
}





/*

function handleArrowNavigation(event) {
    const activeElement = document.activeElement;
    // Find the closest .drag-drop-set container to the currently focused element
    const currentSet = activeElement.closest('.drag-drop-set');
    if (!currentSet) return; // Exit if no parent container matches

    // Selecting elements within the current .drag-drop-set container
    const elements = Array.from(currentSet.querySelectorAll('.target, [data-component="Draggable"][data-selected="true"]'));
    const focusedIndex = elements.indexOf(activeElement);
    
    let nextIndex = focusedIndex; // Default to the current index if no navigation key is pressed
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        // Move focus to the previous item or wrap around to the last item
        nextIndex = focusedIndex - 1 < 0 ? elements.length - 1 : focusedIndex - 1;
    } else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        // Move focus to the next item or wrap around to the first item
        nextIndex = (focusedIndex + 1) % elements.length;
    }

    // Safely attempt to focus the next element in the sequence
    if(elements[nextIndex]) {
        event.preventDefault(); // Prevent default arrow key behavior (scrolling)
        elements[nextIndex].focus();
    }
}

*/






function setupSVGDropZone(dropZoneId, scaleUp) {
    const svgDropZone = document.getElementById(dropZoneId);
    svgDropZone.addEventListener('dragover', function(e) {
        e.preventDefault();
    });

    svgDropZone.addEventListener('drop', function(e) {
        e.preventDefault();
        if (e.dataTransfer.items) {
            if (e.dataTransfer.items[0].kind === 'file') {
                var file = e.dataTransfer.items[0].getAsFile();
                readSVGFile(file, scaleUp);
            }
        }
    });
}

function readSVGFile(file, scaleUp) {
    var reader = new FileReader();
    reader.onload = function(e) {
        replaceDraggablesWithSVG(e.target.result, scaleUp);
    };
    reader.readAsText(file);
}

function replaceDraggablesWithSVG(svgContent, scaleUp) {
    const dropZone = document.querySelector('.sourceTray');
    dropZone.innerHTML = ''; // Clear existing content

    for (let i = 0; i < 4; i++) {
        const svgWrapper = document.createElement('div');
        svgWrapper.classList.add('SVG-default-style');
        svgWrapper.innerHTML = svgContent;

        const svgElement = svgWrapper.querySelector('svg');
        if (svgElement) {
            // Determine original dimensions
            let originalWidth = parseInt(svgElement.getAttribute('width') || 100, 10);
            let originalHeight = parseInt(svgElement.getAttribute('height') || 100, 10);

            // Scale dimensions if scaleUp is true
            if (scaleUp) {
                svgElement.setAttribute('width', originalWidth * 2);
                svgElement.setAttribute('height', originalHeight * 2);
            }

            // Set viewBox if it's not already set
            if (!svgElement.hasAttribute('viewBox')) {
                svgElement.setAttribute('viewBox', `0 0 ${originalWidth} ${originalHeight}`);
            }
        }

        // Add the data-component attribute to make it draggable
        svgWrapper.setAttribute('data-component', 'Draggable');

        svgWrapper.draggable = true;
        svgWrapper.tabIndex = 0; // Make it focusable
        svgWrapper.addEventListener('focus', function() {
            this.classList.add('SVG-focus-state');
        });
        svgWrapper.addEventListener('blur', function() {
            this.classList.remove('SVG-focus-state');
        });
        svgWrapper.addEventListener('click', toggleDraggableSelection);
        svgWrapper.addEventListener('dragstart', dragStart);
        svgWrapper.addEventListener('dragend', dragEnd);
        dropZone.appendChild(svgWrapper);
    }
}





function toggleDraggableSelection(event) {
    const target = event.currentTarget; // Use currentTarget to ensure you're getting the element with the event listener
    const isSelected = target.dataset.selected === "true";
    resetSelectionAndHighlight();

    if (!isSelected) {
        // Check if the element is an SVG draggable
        if (target.classList.contains('SVG-default-style')) {
            target.classList.add('SVG-default-style-selected');
        } else {
            target.classList.add(classConfig.draggableSelected); // Use dynamic class name
        }
        target.dataset.selected = "true";
        highlightTargetsForDraggable(target);
        highlightOthersInDragLocation(target);
        target.focus();
        updateTargetsTabindex(0, target);


    // Find the closest DropZone and apply the faded class to other draggables
    const dropZone = target.closest('.drag-drop-set').querySelector('[data-component="DropZone"]');
    if (dropZone) {
        dropZone.querySelectorAll('[data-component="Draggable"]').forEach(el => {
            // Check if the element is not the target and does not have the SVG-default-style class
            if (el !== target && !el.classList.contains('SVG-default-style')) {
                // Only apply the faded class if fading is enabled
                if (classConfig.fadingEnabled) {
                    el.classList.add(classConfig.draggableFaded);
                } else {
                    el.classList.remove(classConfig.draggableFaded);
                }
            }
        });

        // Update tabindex for the DropZone if it's highlighted
        if (dropZone.classList.contains('target-highlighted')) {
            dropZone.tabIndex = 0;
        }
    }

    } else {
        target.dataset.selected = "false";
        updateTargetsTabindex(-1);

        // Reset tabindex for the DropZone
        const dropZone = target.closest('.drag-drop-set').querySelector('[data-component="DropZone"]');
        if (dropZone) {
            dropZone.tabIndex = -1;
        }
    }
}





function dragStart(event) {
    event.dataTransfer.setData('text/plain', event.target.id);

    // Calculate the offset between the cursor and the top-left corner of the draggable element
    var rect = event.target.getBoundingClientRect();
    var offsetX = event.clientX - rect.left;
    var offsetY = event.clientY - rect.top;

    // Create a transparent image to use as the drag image
    var transparentImage = new Image();
    transparentImage.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    event.dataTransfer.setDragImage(transparentImage, 0, 0);

    // Create a clone of the draggable element
    var dragImage = event.target.cloneNode(true);
    if (event.target.closest('.SVG-default-style')) {
        dragImage.id = "customSVGDragImage"; // Different ID for SVG draggables
        dragImage.classList.add('SVG-default-style-selected'); // Add the selected class for SVG
    } else {
        if (classConfig.draggableSelected === "draggable-selected-set2") {
            dragImage.id = "customDragImage-set2";
        } 
        if (classConfig.draggableSelected === "draggable-selected-set3") {
            dragImage.id = "customDragImage-set3";
        } 
        else {
            dragImage.id = "customDragImage";
        }
    }
    dragImage.style.position = "absolute";
    dragImage.style.zIndex = "10000"; // Ensure it appears on top
    dragImage.style.pointerEvents = "none"; // Prevent the custom drag image from capturing mouse events
    document.body.appendChild(dragImage);

    // Position the custom drag image relative to the cursor using the offset
    dragImage.style.top = (event.clientY + window.scrollY - offsetY) + "px";
    dragImage.style.left = (event.clientX + window.scrollX - offsetX) + "px";

    // Move the custom drag image with the cursor
    document.addEventListener('dragover', function(e) {
        dragImage.style.top = (e.clientY + window.scrollY - offsetY) + "px";
        dragImage.style.left = (e.clientX + window.scrollX - offsetX) + "px";
    });

    // Hide the original element during the drag
    setTimeout(() => event.target.style.visibility = "hidden", 0);

    // Reset any existing highlights
    resetSelectionAndHighlight();

    // Highlight targets and other dropped draggables
    highlightTargetsForDraggable(event.target);
    highlightOthersInDragLocation(event.target);

// Fade other draggable elements in the same context if fading is enabled
const dragDropSet = event.target.closest('.drag-drop-set');
if (dragDropSet && classConfig.fadingEnabled) { // Check if fading is enabled
    const otherDraggables = dragDropSet.querySelectorAll('[data-component="Draggable"]:not([data-selected="true"])');
    otherDraggables.forEach(draggable => {
        // Only apply the faded class to draggables that do not have the SVG-default-style class
        if (!draggable.classList.contains('SVG-default-style')) {
            draggable.classList.add(classConfig.draggableFaded);
        }
    });
}

}


function dragEnd(event) {
    event.target.style.visibility = "visible";

    // Remove the custom drag image for standard draggables
    var customDragImage = document.getElementById("customDragImage");
    if (customDragImage) {
        document.body.removeChild(customDragImage);
    }

        // Check and remove the custom drag image with set2 ID if present
        var customDragImageSet2 = document.getElementById("customDragImage-set2");
        if (customDragImageSet2) {
            document.body.removeChild(customDragImageSet2);
        }

                // Check and remove the custom drag image with set2 ID if present
                var customDragImageSet3 = document.getElementById("customDragImage-set3");
                if (customDragImageSet3) {
                    document.body.removeChild(customDragImageSet3);
                }

    // Remove the custom drag image for SVG draggables
    var customSVGDragImage = document.getElementById("customSVGDragImage");
    if (customSVGDragImage) {
        document.body.removeChild(customSVGDragImage);
    }

    // Reset the highlighted state only after dragging ends
    resetSelectionAndHighlight();
}





function highlightTargetsForDraggable(draggableElement) {
    const dragDropSet = draggableElement.closest('.drag-drop-set');
    if (dragDropSet) {
        // Highlight only targets within the same set
        const targets = dragDropSet.querySelectorAll('.target');
        targets.forEach(target => {
            target.classList.add(classConfig.targetHighlighted); // Use dynamic class from classConfig
            target.addEventListener('click', closePopoverOnClick);
        });

        // Check if the draggable is within a "drag-location"
        if (draggableElement.closest('.drag-location')) {
            // If so, highlight the drop zone within the same drag-drop-set
            const dropZone = dragDropSet.querySelector('.sourceTray'); // Adjust the selector as needed
            if (dropZone) {
                dropZone.classList.add(classConfig.targetHighlighted); // Use dynamic class from classConfig
            }

             // Apply a thin border class if the border weight reduction is enabled
             if (classConfig.borderWeightReduced) {
                dropZone.classList.add('border-weight-reduced');
            } else {
                dropZone.classList.remove('border-weight-reduced');
            }
        }
    }
}


function closePopoverOnClick(event) {
    if (event.target.classList.contains('target-highlighted')) {
        const sourceTray = document.getElementById('source-tray-1');
        if (sourceTray._tippy && sourceTray._tippy.state.isVisible) {
            sourceTray._tippy.hide();
        }
    }
}




function highlightOthersInDragLocation(selectedDraggable) {
    // Step 1: Find the closest `.drag-drop-set` ancestor.
    const dragDropSet = selectedDraggable.closest('.drag-drop-set');
    if (!dragDropSet) return; // If there's no `.drag-drop-set` parent, exit the function.

    // Step 2: Query all `.drag-location` divs within this ancestor.
    const dragLocations = dragDropSet.querySelectorAll('.drag-location');

    // Step 3: Iterate through each `.drag-location` to find and highlight all other draggables.
    dragLocations.forEach(dragLocation => {
        const otherDraggables = dragLocation.querySelectorAll('[data-component="Draggable"]');
        otherDraggables.forEach(draggable => {
            if (draggable !== selectedDraggable) { // Exclude the current draggable
                draggable.classList.add(classConfig.draggableHighlighted);
                     // Apply faded class based on the fadingEnabled setting
                     if (classConfig.fadingEnabled) {
                         draggable.classList.add(classConfig.draggableFaded);
                         } else {
                            draggable.classList.remove(classConfig.draggableFaded);
                          }

                 // Apply a thin border class if the border weight reduction is enabled
                if (classConfig.borderWeightReduced) {
                    draggable.classList.add('draggable-highlighted-thin-border');
                } else {
                    draggable.classList.remove('draggable-highlighted-thin-border');
                }
            }
        });
    });
}







document.addEventListener('DOMContentLoaded', (event) => {
    const dropZones = document.querySelectorAll('[data-component="DropZone"]');

    dropZones.forEach(dropZone => {
        // Add 'dragover' event to ensure 'preventDefault' is called to allow drop
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault(); // Necessary to allow the drop
            // Optionally, you can add conditions here similar to 'dragenter' if needed
        });

        dropZone.addEventListener('dragenter', (e) => {
            // Check if the dropZone has the 'target-highlighted' class
            if(dropZone.classList.contains('target-highlighted')) {
                // Only add 'target-dragged-over' if 'target-highlighted' is present
                dropZone.classList.add('target-dragged-over');
            }
        });

        dropZone.addEventListener('dragleave', (e) => {
            // Always remove 'target-dragged-over' on drag leave, as it's no longer being dragged over
            dropZone.classList.remove('target-dragged-over');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault(); // Prevent default to handle the drop with JavaScript
            console.log('Item dropped');
            // Remove visual feedback regardless of condition
            dropZone.classList.remove('target-dragged-over');
            // Here you might want to handle the drop based on additional conditions
        });
    });
});




document.addEventListener('DOMContentLoaded', (event) => {
    const draggables = document.querySelectorAll('[data-component="Draggable"]');

    draggables.forEach(draggable => {
        // Add 'dragover' event to highlight draggable elements when they are dragged over
        draggable.addEventListener('dragover', (e) => {
            e.preventDefault(); // Necessary to allow the drop
            if (draggable.classList.contains('draggable-highlighted')) {
                draggable.classList.add('draggable-highlighted-hover');
            }
        });

        // Add 'dragleave' event to remove the highlight when the drag leaves the element
        draggable.addEventListener('dragleave', (e) => {
            draggable.classList.remove('draggable-highlighted-hover');
        });

        // Add 'drop' event to handle the drop action
        draggable.addEventListener('drop', (e) => {
            e.preventDefault(); // Prevent default to handle the drop with JavaScript
            draggable.classList.remove('draggable-highlighted-hover');
            // Here you might want to handle the drop based on additional conditions
        });
    });
});






function dragOver(event) {
    event.preventDefault();
    // Attempt to find the closest DropZone, highlighted target, or highlighted draggable from the event target
    let target = event.target.closest(`.${classConfig.targetHighlighted}, .sourceTray, .${classConfig.draggableHighlighted}`);
    if (!target) { // If no such element is found, try to use currentTarget as a fallback
        target = event.currentTarget.closest(`.${classConfig.targetHighlighted}, .sourceTray, .${classConfig.draggableHighlighted}`);
    }
    if (target) {
        if (target.classList.contains(classConfig.targetHighlighted)) {
            target.classList.add(classConfig.targetDraggedOver);
            // Check if the reduce border weight toggle is active
            if (document.getElementById('borderWeightToggle').checked) {
                target.classList.add('targetHighlight-weight-reduced');
            }
        } else if (target.classList.contains(classConfig.draggableHighlighted)) {
            target.classList.add(classConfig.draggableHighlightedHover);
            // Apply reduced border weight if the toggle is active
            if (document.getElementById('borderWeightToggle').checked) {
                target.classList.add('targetHighlight-weight-reduced');
            }
        }
    }
}


function dragLeave(event) {
    // Similar direct check as in dragOver
    const target = event.target.closest(`.${classConfig.targetHighlighted}, .sourceTray.${classConfig.targetHighlighted}, .${classConfig.draggableHighlightedHover}`);
    if (target) {
        target.classList.remove(classConfig.targetDraggedOver, classConfig.draggableHighlightedHover);
        // Also remove the border weight reduction class
        if (target.classList.contains('targetHighlight-weight-reduced')) {
            target.classList.remove('targetHighlight-weight-reduced');
        }
    }
}







// Flag to track if the popover has been shown
let popoverShown = false;

function drop(event) {
    event.preventDefault();

    const target = event.target.closest('.target-highlighted, .sourceTray.target-highlighted, .draggable-highlighted-hover');
    if (target) {
        target.classList.remove('target-dragged-over', 'targetHighlight-weight-reduced', 'draggable-highlighted-hover');

        // Check if the popover has not been shown and the target is one of the specified IDs
        if (!popoverShown && ['target1', 'target2', 'target3'].includes(target.id)) {
            // Find the source tray element
            const sourceTray = document.getElementById('source-tray-1');

            // Create and show the Tippy popover on the source tray
            const popover = tippy(sourceTray, {
                content: '<p style="margin:0 0 0.5rem 0;"><strong>Drag and drop or click and click</strong></p> You can also select or click one of these options, and then select where you want to place it.<button class="okay-button" onclick="closePopover()">Okay</button>',
                allowHTML: true, // Allow HTML content
                interactive: true, // Make the popover interactive
                trigger: 'manual', // Manual triggering
                maxWidth: '380px', // Increase the width as needed
                hideOnClick: false // Keep the popover open when clicking outside
            });

            // Show the popover
            popover.show();

            // Set the flag to true to prevent showing the popover again
            popoverShown = true;
        }
    }
}









// Function to close the popover
function closePopover() {
    const sourceTray = document.getElementById('source-tray-1');
    sourceTray._tippy.hide();
}












function resetSelectionAndHighlight() {
    // Reset draggable elements
    document.querySelectorAll(`.${classConfig.draggableSelected}, .SVG-default-style-selected`).forEach(el => {
        el.classList.remove(classConfig.draggableSelected, 'SVG-default-style-selected'); // Adjust as needed for SVG
        el.dataset.selected = "false"; // Update data-selected attribute
    });

    // Reset targets and drop zones
    document.querySelectorAll(`.${classConfig.targetHighlighted}, ${classConfig.targetDraggedOver}`).forEach(target => {
        target.classList.remove(classConfig.targetHighlighted, classConfig.targetDraggedOver);
        target.tabIndex = -1; // Reset tabindex
    });

    // Remove the 'draggableFaded' class from all elements
    document.querySelectorAll(`.${classConfig.draggableFaded}`).forEach(el => {
        el.classList.remove(classConfig.draggableFaded);
    });

        // Remove the 'draggable-highlighted-thin-border' class from all elements
        document.querySelectorAll('.draggable-highlighted-thin-border').forEach(el => {
            el.classList.remove('draggable-highlighted-thin-border');
        });

    // Specific drop zone example
    const specificDropZone = document.getElementById('source-tray-2');
    if (specificDropZone) {
        specificDropZone.classList.remove(classConfig.targetHighlighted);
        specificDropZone.tabIndex = -1; // Reset tabindex
    }

    // Reset other highlighted draggable elements
    document.querySelectorAll(`.${classConfig.draggableHighlighted}`).forEach(el => {
        el.classList.remove(classConfig.draggableHighlighted);
    });

    // Reset tabindex for all targets as a catch-all
    updateTargetsTabindex(-1);
}







document.addEventListener('click', function(event) {
    let isDraggable = event.target.closest('[data-component="Draggable"]');
    if (!isDraggable) {
        resetSelectionAndHighlight();
    }
});






