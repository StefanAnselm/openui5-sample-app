/* global QUnit */

sap.ui.define([
	"sap/ui/test/opaQunit",
	"sap/ui/demo/todo/test/integration/pages/App"
], (opaTest) => {
	"use strict";

	QUnit.module("Todo List");

	opaTest("should add an item", (Given, When, Then) => {

		// Arrangements
		Given.iStartMyApp();

		//Actions
		When.onTheAppPage.iEnterTextForNewItemAndPressEnter("my test");

		// Assertions
		Then.onTheAppPage.iShouldSeeTheItemBeingAdded(3, "MY TEST");

		// Cleanup
		Then.iTeardownMyApp();
	});

	opaTest("should remove a completed item", (Given, When, Then) => {

		// Arrangements
		Given.iStartMyApp();

		//Actions
		When.onTheAppPage.iEnterTextForNewItemAndPressEnter("my test")
			.and.iSelectAllItems(true)
			.and.iClearTheCompletedItems()
			.and.iEnterTextForNewItemAndPressEnter("my test");

		// Assertions
		Then.onTheAppPage.iShouldSeeAllButOneItemBeingRemoved("MY TEST");

		// Cleanup
		Then.iTeardownMyApp();
	});

	opaTest("should select an item", (Given, When, Then) => {

		// Arrangements
		Given.iStartMyApp();

		//Actions
		When.onTheAppPage.iEnterTextForNewItemAndPressEnter("my test")
			.and.iSelectTheLastItem(true);

		// Assertions
		Then.onTheAppPage.iShouldSeeTheLastItemBeingCompleted(true);

		// Cleanup
		Then.iTeardownMyApp();
	});

	opaTest("should unselect an item", (Given, When, Then) => {

		// Arrangements
		Given.iStartMyApp();

		//Actions
		When.onTheAppPage.iEnterTextForNewItemAndPressEnter("my test")
			.and.iSelectAllItems(true)
			.and.iClearTheCompletedItems()
			.and.iEnterTextForNewItemAndPressEnter("my test")
			.and.iSelectTheLastItem(true)
			.and.iSelectTheLastItem(false);

		// Assertions
		Then.onTheAppPage.iShouldSeeTheLastItemBeingCompleted(false);

		// Cleanup
		Then.iTeardownMyApp();
	});
	
	opaTest("should complete all items", (Given, When, Then) => {

		// Arrangements
		Given.iStartMyApp();

		//Actions
		When.onTheAppPage.iEnterTextForNewItemAndPressEnter("my test2")
			.and.iCompleteAllItems()

		// Assertions
		Then.onTheAppPage.iShouldSeeAllItemsCompleted(true);

		// Cleanup
		Then.iTeardownMyApp();
	});
});
