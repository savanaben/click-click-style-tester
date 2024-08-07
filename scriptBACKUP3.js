
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
        // Check if the focused element is not among the focusable elements and is not a draggable
        if (!Array.from(focusableElements).includes(event.target) && !event.target.matches('[data-component="Draggable"]')) {
            resetSelectionAndHighlight();
        }
    } else {
        // If not within a drag-drop-set, check if the focused element is not a draggable before resetting
        if (!event.target.matches('[data-component="Draggable"]')) {
            resetSelectionAndHighlight();
        }
    }
});

    setupKeyboardNavigation();

        // Call toggleBorderWeightFeature with true to enable it by default
        toggleBorderWeightFeature(true);

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
        const container = target.closest('.draggable-container');
        if (container) {
            const selectedDraggable = container.querySelector('.draggable-selected');
            // Skip updating tabindex for targets within the same draggable-container that has a selected draggable
            if (selectedDraggable) {
                return;
            }
        }
        target.tabIndex = tabindexValue;
    });
}

// Call updateTargetsTabindex with -1 initially to ensure targets are not tabbable by default
document.addEventListener('DOMContentLoaded', () => {
    updateTargetsTabindex(-1);
});


function setupKeyboardNavigation() {
document.addEventListener('keydown', (event) => {

    // Handle Esc key to reset selections and highlights and return focus
    if (event.key === 'Escape' || event.key === 'Esc') {  // 'Esc' for older browsers
        // Find the element that was previously selected
        const previouslySelected = document.querySelector('[data-component="Draggable"][data-selected="true"]');
        resetSelectionAndHighlight();
        if (previouslySelected) {
            previouslySelected.focus();  // Return focus to the previously selected draggable
        }
        return; // Early exit after handling Esc
    }


// Keydown event listener for handling Enter or Space key on sourceTray or target

    if (event.key === 'Enter' || event.key === ' ') { // Check for Enter or Space key
        const target = event.target;
        if (target.classList.contains('sourceTray') || target.classList.contains('target')) {
            resetSelectionAndHighlight();
        }
    }


    // Explicitly prevent default behavior for up and down arrow keys within specific contexts
    if ((event.key === 'ArrowUp' || event.key === 'ArrowDown') && event.target.closest('.drag-drop-set')) {
        event.preventDefault();
        handleArrowNavigation(event);
        return; // Early exit after handling navigation
    }


 else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        handleArrowNavigation(event); // Handle only left and right arrow keys
    }
});
}



function handleArrowNavigation(event) {
    const activeElement = document.activeElement;
    const currentSet = activeElement.closest('.drag-drop-set');
    if (!currentSet) return;

    const elements = Array.from(currentSet.querySelectorAll('.target-highlighted, .draggable-highlighted, [data-component="Draggable"], [data-component="DropZone"].target-highlighted'));
    const focusedIndex = elements.indexOf(activeElement);

    let nextIndex = focusedIndex;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
        nextIndex = focusedIndex - 1 < 0 ? elements.length - 1 : focusedIndex - 1;
    } else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
        nextIndex = (focusedIndex + 1) % elements.length;
    }

    // Find the next focusable element that is not a target within a container with a selected draggable
    while (elements[nextIndex]) {
        const container = elements[nextIndex].closest('.draggable-container');
        const isSelectedDraggable = elements[nextIndex].matches('[data-component="Draggable"][data-selected="true"]');
        
        if (container) {
            const selectedDraggable = container.querySelector('.draggable-selected');
            // Allow focusing on the selected draggable but skip targets within the same container
            if (!selectedDraggable || isSelectedDraggable) {
                break; // Found a valid element to focus
            }
        } else if (isSelectedDraggable || !elements[nextIndex].matches('[data-component="Draggable"]')) {
            break; // Found a valid element to focus
        }

        // Move to the next element
        if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
            nextIndex = nextIndex - 1 < 0 ? elements.length - 1 : nextIndex - 1;
        } else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
            nextIndex = (nextIndex + 1) % elements.length;
        }

        // Prevent infinite loop
        if (nextIndex === focusedIndex) {
            return;
        }
    }

    if (elements[nextIndex]) {
        event.preventDefault();
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
        const svgContent = e.target.result;
        replaceDraggablesWithSVG(svgContent, scaleUp);
        replaceFirstDragLocationWithSVG(svgContent, scaleUp);
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

function replaceFirstDragLocationWithSVG(svgContent, scaleUp) {
    // Find the first drag location
    const firstDragLocation = document.querySelector('.drag-location');

    if (firstDragLocation) {
        // Clear existing content
        firstDragLocation.innerHTML = '';

        for (let i = 0; i < 4; i++) {
            // Create the container div
            const containerDiv = document.createElement('div');
            containerDiv.classList.add('draggable-container');

            // Create the SVG wrapper
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
                    originalWidth *= 2;
                    originalHeight *= 2;
                }

                // Set viewBox if it's not already set
                if (!svgElement.hasAttribute('viewBox')) {
                    svgElement.setAttribute('viewBox', `0 0 ${originalWidth} ${originalHeight}`);
                }

                // Create the target-behind div
                const targetBehind = document.createElement('div');
                targetBehind.classList.add('target', 'svg-target-behind');
                targetBehind.setAttribute('id', `target-behind-${i + 1}`);
                targetBehind.style.width = `${originalWidth}px`;
                targetBehind.style.height = `${originalHeight}px`;
                targetBehind.setAttribute('tabindex', '-1');
  

                // Append the SVG wrapper and target-behind to the container div
                containerDiv.appendChild(svgWrapper);
                containerDiv.appendChild(targetBehind);

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

                // Append the container div to the first drag location
                firstDragLocation.appendChild(containerDiv);
            }
        }
    }
}



function toggleDraggableSelection(event) {
    const target = event.currentTarget; // Use currentTarget to ensure you're getting the element with the event listener
    const isSelected = target.dataset.selected === "true";
    resetSelectionAndHighlight();

    // Now check for the 'draggable-highlighted' class after other updates
    // this is not working. it's not finding the draggable-highlighted class. I think there's an order of operations issue. 

    // if (target.classList.contains('draggable-highlighted')) {
    //     console.log("Resetting selection and highlight due to class match.");
    //     resetSelectionAndHighlight();
    //     return;  // Exit the function early to prevent further execution
    // }


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
            if (el !== target) { // Check if the element is not the target
                if (classConfig.fadingEnabled) {
                    if (el.classList.contains('SVG-default-style')) {
                        el.classList.add('svg-faded'); // Apply svg-faded for SVG draggables
                    } else {
                        el.classList.add(classConfig.draggableFaded); // Apply draggable-faded for other draggables
                    }
                } else {
                    el.classList.remove('svg-faded', classConfig.draggableFaded); // Remove both classes if fading is disabled
                }
            }
        });

        // Update tabindex for the DropZone if it's highlighted
        if (dropZone.classList.contains('target-highlighted')) {
            dropZone.tabIndex = 0;
        }
    }

        // New functionality: Disable buttons and allow click propagation. this is to disable draggables in the source location when you've clicked a draggable in a target. we need to do this to allow you to return a draggable to the source location, if repeat draggables are allowed. 
        if (target.closest('.drag-location')) {
            const dragDropSet = target.closest('.drag-drop-set');
            const dropZone = dragDropSet.querySelector('[data-component="DropZone"]');
            if (dropZone) {
                dropZone.querySelectorAll('button').forEach(button => {
                    button.disabled = true;
                });
            }
        }

    } 
    

    
    else {
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
        applyCustomStyles(dragImage); // Manually apply styles
    } else {
        if (classConfig.draggableSelected === "draggable-selected-set2") {
            dragImage.id = "customDragImage-set2";
        } 
        else if (classConfig.draggableSelected === "draggable-selected-set3") {
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
        if (draggable.classList.contains('SVG-default-style')) {
            draggable.classList.add('svg-faded'); // Apply svg-faded for SVG draggables
        } else {
            draggable.classList.add(classConfig.draggableFaded); // Apply draggable-faded for other draggables
        }
    });
}

function applyCustomStyles(element) {
    element.style.outlineStyle = "solid";
    element.style.outlineWidth = "3px";
    element.style.outlineOffset = "2px";
    element.style.backgroundColor = "white";
    element.style.outlineColor = "#0050C6";
    element.style.borderRadius = "3px";
    element.style.zIndex = "10000";
    element.style.boxShadow = "0px 0px 0px 2px rgba(255,255,255,1), 0px 2px 4px 4px rgba(0, 0, 0, 0.23)";
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



function playVideo() {
    const video = document.getElementById('customVideoPlayer');
    const playButton = document.querySelector('.play-button');

    // Toggle play/pause and hide/show the play button
    if (video.paused) {
        video.play();
        playButton.style.display = 'none'; // Hide play button when video is playing
    } else {
        video.pause();
        playButton.style.display = 'flex'; // Show play button when video is paused
    }

    // Add event listener for when the video ends
    video.addEventListener('ended', function() {
        playButton.style.display = 'flex'; // Show play button when video ends
    });
}



let popoverInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    const sourceTray = document.getElementById('source-tray-1');

    // Initialize the popover
    popoverInstance = tippy(sourceTray, {
        content: `<h3 style="margin:0 0 0.2rem 0;"><strong>Try click and click!</strong></h3>
                  <p class="stem-text" style="margin:0 0 0.5rem 0;">Select or click one of the options. Then select where you want to place it.</p>
                  <div class="video-container" style="position: relative; width: 100%; max-width: 270px; margin: auto;">
                      <video id="customVideoPlayer" style="width: 100%; display: block; border-radius:4px; margin-bottom:4px;">
                          <source src="Comp 1-1.mp4" type="video/mp4">
                          Your browser does not support the video tag.
                      </video>
                      <button class="play-button" onclick="playVideo()" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); border: none; background-color: transparent; width: 100px; height: 100px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                          <div style="border-radius: 50%; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
                              <svg data-component="SVG" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="white" data-icon-name="play-circle" focusable="false" role="presentation" class="css-1ev6far" style="background-color: black;background-color: rgba(0, 0, 0, 0.85);border-radius: 500px;">
                                  <path d="M24 2c12.147 0.009 21.991 9.858 21.991 22.006 0 9.056-5.47 16.834-13.286 20.211l-0.143 0.055c-2.502 1.072-5.414 1.696-8.472 1.696-12.154 0-22.006-9.853-22.006-22.006 0-9.027 5.435-16.784 13.211-20.178l0.142-0.055c2.514-1.093 5.442-1.728 8.519-1.728 0.015 0 0.031 0 0.046 0h-0.002zM24 0c-13.255 0-24 10.745-24 24s10.745 24 24 24 24-10.745 24-24-10.745-24-24-24zM18 12v24l18-12z"></path>
                              </svg>
                          </div>
                      </button>
                  </div>
                  <button class="okay-button" onclick="closePopover()">Okay</button>`,
        allowHTML: true,
        interactive: true,
        trigger: 'manual',
        maxWidth: '410px',
        hideOnClick: false
    });
});

function showPopover() {
    if (popoverInstance) {
        popoverInstance.show();
    }
}


function drop(event) {
    event.preventDefault();

    const target = event.target.closest('.target-highlighted, .sourceTray.target-highlighted, .draggable-highlighted-hover');
    if (target) {
        target.classList.remove('target-dragged-over', 'targetHighlight-weight-reduced', 'draggable-highlighted-hover');

        // Check if the popover has not been shown and the popover has not been shown and the target is one of the specified IDs:
        if (!popoverShown && ['target1', 'target2', 'target3'].includes(target.id)) {
            showPopover(); // Show the popover using the previously defined function
            popoverShown = true; // Set the flag to true to prevent showing the popover again
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const showPopoverButton = document.getElementById('showPopoverButton');
    showPopoverButton.addEventListener('click', showPopover);
});


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
        target.classList.remove(classConfig.targetHighlighted, classConfig.targetDraggedOver, 'target-dragged-over');
        target.tabIndex = -1; // Reset tabindex
    });

    // Remove the 'draggableFaded' class from all elements
    document.querySelectorAll(`.${classConfig.draggableFaded}, .svg-faded`).forEach(el => {
        el.classList.remove(classConfig.draggableFaded, 'svg-faded');
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

        // Re-enable all draggable buttons
        document.querySelectorAll('[data-component="DropZone"] button').forEach(button => {
            button.disabled = false; // Enable the button
        });
}







document.addEventListener('click', function(event) {
    let isDraggable = event.target.closest('[data-component="Draggable"]');
    if (!isDraggable) {
        resetSelectionAndHighlight();
    }
});






