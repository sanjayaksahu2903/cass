RelationshipViewScreen = (function (RelationshipViewScreen) {

    var relationTypes = {
        isEnabledBy: "is Enabled by",
        requires: "Requires",
        desires: "Desires",
        narrows: "Narrows",
        isRelatedTo: "is Related to",
        isEquivalentTo: "is Equivalent to"
    }

    function displayRelation(relation) {

        if (relation.privateEncrypted)
            $("#relationshipViewerPrivateSymbol").removeClass("hide");
        else
            $("#relationshipViewerPrivateSymbol").addClass("hide");

        if (relation.source != undefined) {
            EcCompetency.get(relation.source, function (competency) {
                var a = $("<a></a>");
                a.attr("href", "#" + CompetencyViewScreen.displayName);
                a.text(competency.name)
                $("#relationshipViewerSource").append(a);
                $("#relationshipViewerSource").click(function (event) {
                    event.preventDefault();
                    ScreenManager.changeScreen(new CompetencyViewScreen(competency));
                });
            }, function (err) {
                try {
                    var parsedErr = JSON.parse(err);
                    if (parsedErr.msg == undefined && parsedErr.message == undefined) {
                        $("#relationshipViewerSource").text("Unknown Competency");
                        $("#relationshipViewerSource").css("font-style", "italic");
                    }
                } catch (e) {
                    errorFindingSource(err);
                }
            });
        }

        if (relation.target != undefined) {
            EcCompetency.get(relation.target, function (competency) {
                var a = $("<a></a>");
                a.attr("href", "#" + CompetencyViewScreen.displayName);
                a.text(competency.name)
                $("#relationshipViewerTarget").append(a);
                $("#relationshipViewerTarget").click(function (event) {
                    event.preventDefault();
                    ScreenManager.changeScreen(new CompetencyViewScreen(competency));
                });
            }, function (err) {
                try {
                    var parsedErr = JSON.parse(err);
                    if (parsedErr.msg == undefined && parsedErr.message == undefined) {
                        $("#relationshipViewerTarget").text("Unknown Competency");
                        $("#relationshipViewerTarget").css("font-style", "italic");
                    }
                } catch (e) {
                    errorFindingTarget(err);
                }
            });
        }

        if (relation.relationType != undefined && relationTypes[relation.relationType] != undefined) {
            $("#relationshipViewerType").text(relationTypes[relation.relationType]);
        } else {
            $("#relationshipViewerType").text("has a relationship with");
        }

        $("#relationshipViewerId").text(relation.id);
        if (relation.name == null || relation.name == undefined)
            $(".relationshipViewerName").text("Relation");
        else
            $(".relationshipViewerName").text(relation.name);
        $("#relationshipViewerDescription").text(relation.description);

        if (relation.owner != undefined && relation.owner.length > 0) {
            $("#relationshipViewerOwner").text("")
            for (var i = 0; i < relation.owner.length; i++) {
                if (i > 0)
                    $("#relationshiperViewerOwner").append(", ");

                var pem = relation.owner[i];

                var contact = $(createContactSmall(pem));
                $("#relationshipViewerOwner").append(contact);
            }
        } else {
            $("#relationshipViewerOwner").text("Public")
        }

    }


    function errorRetrieving(err) {
        if (err == undefined)
            err = "Unable to Connect to Server to Retrieve Relation";

        ViewManager.getView("#competencyViewMessageContainer").displayAlert(err, "getRelation");
    }

    function errorFindingSource(err) {
        if (err == undefined)
            err = "Unable to Connect to Server to Retrieve Source Competency";

        ViewManager.getView("#competencyViewMessageContainer").displayAlert(err, "getSource");
    }

    function errorFindingTarget(err) {
        if (err == undefined)
            err = "Unable to Connect to Server to Retrieve Target Competency";

        ViewManager.getView("#competencyViewMessageContainer").displayAlert(err, "getTarget");
    }

    RelationshipViewScreen.prototype.display = function (containerId, callback) {
        var data = this.data;

        if (data.id != null) {
            ScreenManager.setScreenParameters({
                "id": data.id
            })
        }


        ViewManager.showView(new MessageContainer("relationshipView"), "#relationshipViewMessageContainer");

        $("#relationshipViewSearchBtn").attr("href", "#" + RelationshipSearchScreen.prototype.displayName);
        $("#relationshipViewSearchBtn").click(function (event) {
            event.preventDefault();
            ScreenManager.changeScreen(new RelationshipSearchScreen(data))
        });

        $("#relationshipViewBtn").attr("href", "#" + RelationshipViewScreen.prototype.displayName);
        $("#relationshipViewBtn").click(function (event) {
            event.preventDefault();
        });


        if (AppController.identityController.canEdit(data)) {
            $("#editRelationshipBtn").click(function (event) {
                event.preventDefault();
                ScreenManager.changeScreen(new RelationshipEditScreen(data))
            })
        } else {
            $("#editRelationshipBtn").remove();
        }

        if (!AppController.identityController.owns(data) && !AppController.loginController.getAdmin()) {
            $("#relationshipViewDeleteBtn").remove();
        } else {
            $("#relationshipViewDeleteBtn").click(function () {
                ModalManager.showModal(new ConfirmModal(function () {
                    data._delete(function () {
                        ScreenManager.changeScreen(new RelationshipSearchScreen());
                    }, function (err) {
                        if (err == undefined)
                            err = "Unable to connect to server to delete relationship";
                        ViewManager.getView("#relationshipViewMessageContainer").displayAlert(err)
                    });
                    ModalManager.hideModal();
                }, "Are you sure you want to delete this relationship?"))
            })
        }


        EcAlignment.get(data.id, function (result) {
            data = result;
            displayRelation(result);
        }, errorRetrieving);

    };

    return RelationshipViewScreen;
})(RelationshipViewScreen);
