'use strict';
const mongoose = require('mongoose');
const IssueModel = require('../models').Issue;
const ProjectModel = require('../models').Project;

module.exports = function (app) {

    app.route('/api/issues/:project')
        .get(function (req, res){
            let project = req.params.project;
            ProjectModel.findOne({name: project}, (err, projectData) => {
                if(!projectData){
                    res.json([]);
                }
                else{
                    const filterEntries = Object.entries(req.query);
                    res.json(projectData.issues.filter(d => filterEntries.every(([key, value]) => d[key] === value)));
                }
            });
        })
        .post(function (req, res){
            let project = req.params.project;
            const {
                issue_title,
                issue_text,
                created_by,
                assigned_to,
                status_text
            } = req.body;
            if(!issue_title || !issue_text || !created_by){
                res.json({error: 'required field(s) missing'});
            }

            const newIssue = new IssueModel({
                issue_title: issue_title,
                issue_text: issue_text,
                created_by: created_by,
                created_on: new Date(),
                updated_on: new Date(),
                assigned_to: assigned_to || '',
                status_text: status_text || '',
                open: true
            });
            ProjectModel.findOne({name: project}, (err, projectData) => {
                if(!projectData){
                    const newProject = new ProjectModel({
                        name: project,
                        issues: [newIssue]
                    });
                    newProject.save((err, data) => {
                        err || !data
                            ? res.send("There was an error saving in post")
                            : res.json(data);
                    });
                }
                else{
                    projectData.issues.push(newIssue);
                    projectData.save((err, data) => {
                        err || !data
                            ? res.send("There was an error saving in post")
                            : res.json(data);
                    });
                }
            });

        })
        .put(function (req, res){
            let project = req.params.project;
            const {
                _id,
                issue_title,
                issue_text,
                created_by,
                assigned_to,
                status_text
            } = req.body;
            ProjectModel.findOne({name: project}, (err, projectData) => {
                if(!projectData) res.send("Project not found");
                else{
                    ProjectModel.aggregate([
                        {$match: {name: project}},
                        {$unwind: $issues},
                        _id != undefined
                        ? 
                    ]);
                }
            });
        })
        .delete(function (req, res){
            let project = req.params.project;
        });
};
