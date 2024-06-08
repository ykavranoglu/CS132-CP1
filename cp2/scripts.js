/**
 * CS 132
 * CP2: List of Strings Visualizer
 * Author: A. Yusuf Kavranoglu
 * 
 * Summary: This app allows the user to create a linked list of strings and visualize it.
 * This is the main js file.
 * 
 */

(function() {
    "use strict";

    const NEW_NODE_DATA = "This is a new node. Select this node to change this string.";

    /**
     * Creates event listeners and initializes the states for buttons
     */
    function init() {
        // Event listener for the head node
        qs(".node-wrapper").addEventListener("click", selectToggle);

        qs("#create-btn").addEventListener("click", createChildToSelected);
        qs("#delete-btn").addEventListener("click", deleteSelected);

        // disable the creation and deletion buttons at the start since no nodes are selected
        qs("#create-btn").disabled = true;
        qs("#delete-btn").disabled = true;

        // Event listener to textarea to update the text in selected node with every change
        qs("#text-edit").addEventListener("input", updateSelectedNodeData);
    }

    /**
     * Generates required DOM elements and creates their hierarchy with each other.
     * Then, this DOM structure is added to the html. A random unique ID is generated for each
     * created node, and the linking between the generated node, its child and parent is made.
     * Here, child and parent refers to linked list logic and not to the relations between DOM 
     * elements. DOM elements are actually created as siblings here.
     * @param {Object} parentNode This is the parent node of the node to be created.
     * 
     */
    function generateNode(parentNode) {
        
        const section = gen("section");
        section.id = crypto.randomUUID();
        section.classList.add("node-wrapper");

        const divNode = gen("div");
        divNode.classList.add("node");
        section.appendChild(divNode);

        const h3Node = gen("h3");
        h3Node.textContent = `Node ID: ${section.id}`;
        divNode.appendChild(h3Node);

        const pNode = gen("p");
        pNode.textContent = `Child Node ID: ${childNodeId(parentNode)}`;
        divNode.appendChild(pNode);

        const pArrow = gen("p");
        pArrow.textContent = "==>";
        section.appendChild(pArrow);

        const divNodeData = gen("div");
        divNodeData.classList.add("node-data");
        section.appendChild(divNodeData);

        const h3NodeData = gen("h3");
        h3NodeData.textContent = "Node data";
        divNodeData.appendChild(h3NodeData);

        const pNodeData = gen("p");
        pNodeData.textContent = NEW_NODE_DATA;
        divNodeData.appendChild(pNodeData);

        // Do this addition in the last step, because we get Node ID information from the past
        // child of the parentNode.
        if (parentNode.nextElementSibling) {
            qs("#assembly").insertBefore(section, parentNode.nextElementSibling);
        }
        else {
            qs("#assembly").appendChild(section);
        }

        // Change parent"s Child ID
        parentNode.querySelector(".node p").textContent = "Child " + section.id;

        section.addEventListener("click", selectToggle);
    }

    /**
     * Here, a node is passed as an argument, and its child is returned. Here, child and parent
     * refers to linked list logic and not to the relations between DOM elements. DOM elements
     * are actually created as siblings here.
     * @param {Object} node the node whose child will be returned (in terms of linked list logic).
     * @returns {Object} Child node is returned
     */
    function childNodeId(node) {
        if (node.nextElementSibling) {
            return node.nextElementSibling.id;
        }
        else {
            return null;
        }
    }

    /**
     * Whenever a node is clicked on, run this, which toggles the "selected" class for the clicked
     * object. This also removes the "selected" class from any other nodes.
     * Also handles the enabling and disabling of inputs, like the buttons and the textarea.
     */
    function selectToggle() {
        // remove "selected class from all, no node is selected as a result if true
        if (this.classList.contains("selected")) {
            for (let i = 0; i < qsa(".node-wrapper").length; i++) {
                qsa(".node-wrapper")[i].classList.remove("selected");
            }

            // if none are selected, cannot create or delete
            qs("#create-btn").disabled = true;
            qs("#delete-btn").disabled = true;


            // if none are selected, empty the text-edit section and disable
            qs("#text-edit").disabled = true;
            qs("#text-edit").value = ""

        }
        // remove "selected" class from all and add it to this
        else {
            for (let i = 0; i < qsa(".node-wrapper").length; i++) {
                qsa(".node-wrapper")[i].classList.remove("selected");
            }
            this.classList.add("selected");

            // activate creation button and text-edit since a node is selected
            qs("#create-btn").disabled = false;
            qs("#text-edit").disabled = false;
            // activate deletion button as well if selected has a child.
            if (this.nextElementSibling || (this.previousElementSibling.tagName !==  "H2")) {
                qs("#delete-btn").disabled = false;
            }

            // populate text-edit textarea with the node"s data.
            qs("#text-edit").value = qs(".selected").querySelector(".node-data p").textContent.trim();

        }
    }

    /**
     * Create a child node whose parent (in terms of linked list logic) is the selected node.
     * Also enables the delete-btn because when there are 2 or more nodes and a node is selected,
     * deletion is valid.
     */
    function createChildToSelected() {
        generateNode(qs(".selected"));

        // There can"t be any constraint to deletion after a creation
        qs("#delete-btn").disabled = false;
    }

    /**
     * Deletes the selected node, and modifies the parent/child relations of the parent and child 
     * of "this" accordingly.
     */
    function deleteSelected() {
        let newChildIDForParent = null;
        if (qs(".selected").nextElementSibling) {
            newChildIDForParent = "Child ID: " + qs(".selected").nextElementSibling.id;
        }
        else {
            newChildIDForParent = "Child ID: null"
        }

        if (qs(".selected").previousElementSibling && qs(".selected").previousElementSibling.querySelector(".node p")) {
            qs(".selected").previousElementSibling.querySelector(".node p").textContent = 
                newChildIDForParent;
        }
        
        qs(".selected").remove();

        // none will be selected after deletion, cannot create or delete
        qs("#create-btn").disabled = true;
        qs("#delete-btn").disabled = true;

        // if none are selected, empty the text-edit section and disable
        qs("#text-edit").disabled = true;
        qs("#text-edit").value = ""
    }

    /**
     * This runs whenever there is an input to text-edit textarea and changes the selected node"s
     * data area accordingly.
     */
    function updateSelectedNodeData() {
        qs(".selected").querySelector(".node-data p").textContent = qs("#text-edit").value;
    }

    // Run the init because we are using the defer method and not an event listener.
    init();
  })();