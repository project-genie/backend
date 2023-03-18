import { Organization } from "../models/organization.model.js";

export async function createOrganization(req, res) {
  const { name, description } = req.body;
  try {
    const newOrganization = await Organization.create({
      name,
      description,
    });
    return res.json(newOrganization);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

export async function deleteOrganization(req, res) {}

export async function updateOrganization(req, res) {}

export async function getOrganizations(req, res) {}

export async function getOrganizationUsers(req, res) {}
