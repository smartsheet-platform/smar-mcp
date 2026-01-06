import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SmartsheetAPI } from "../apis/smartsheet-api.js";
import { z } from "zod";

export function getGroupsTools(server: McpServer, api: SmartsheetAPI, allowDeleteTools: boolean) {

  server.tool(
    "list_groups",
    "Lists all groups in the organization",
    {},
    async () => {
      try {
        console.info("Listing all groups");
        const groups = await api.groups.listGroups();
        return {
          content: [{ type: "text", text: JSON.stringify(groups, null, 2) }]
        };
      } catch (error: any) {
        console.error("Failed to list groups", { error });
        return {
          content: [{ type: "text", text: `Failed to list groups: ${error.message}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "get_group",
    "Gets details of a specific group",
    {
      groupId: z.number().describe("The ID of the group"),
    },
    async ({ groupId }) => {
      try {
        console.info(`Getting group ${groupId}`);
        const group = await api.groups.getGroup(groupId);
        return {
          content: [{ type: "text", text: JSON.stringify(group, null, 2) }]
        };
      } catch (error: any) {
        console.error(`Failed to get group ${groupId}`, { error });
        return {
          content: [{ type: "text", text: `Failed to get group: ${error.message}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "create_group",
    "Creates a new group",
    {
      name: z.string().describe("Name for the group"),
      description: z.string().optional().describe("Description for the group"),
      members: z.array(z.object({
        email: z.string().describe("Email of the member to add"),
      })).optional().describe("Initial members to add to the group"),
    },
    async ({ name, description, members }) => {
      try {
        console.info(`Creating group "${name}"`);
        const result = await api.groups.createGroup({ name, description, members });
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      } catch (error: any) {
        console.error(`Failed to create group "${name}"`, { error });
        return {
          content: [{ type: "text", text: `Failed to create group: ${error.message}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "update_group",
    "Updates an existing group",
    {
      groupId: z.number().describe("The ID of the group to update"),
      name: z.string().optional().describe("New name for the group"),
      description: z.string().optional().describe("New description for the group"),
      ownerId: z.number().optional().describe("ID of the new owner"),
    },
    async ({ groupId, name, description, ownerId }) => {
      try {
        console.info(`Updating group ${groupId}`);
        const result = await api.groups.updateGroup(groupId, { name, description, ownerId });
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      } catch (error: any) {
        console.error(`Failed to update group ${groupId}`, { error });
        return {
          content: [{ type: "text", text: `Failed to update group: ${error.message}` }],
          isError: true
        };
      }
    }
  );

  if (allowDeleteTools) {
    server.tool(
      "delete_group",
      "Deletes a group",
      {
        groupId: z.number().describe("The ID of the group to delete"),
      },
      async ({ groupId }) => {
        try {
          console.info(`Deleting group ${groupId}`);
          await api.groups.deleteGroup(groupId);
          return {
            content: [{ type: "text", text: `Successfully deleted group ${groupId}` }]
          };
        } catch (error: any) {
          console.error(`Failed to delete group ${groupId}`, { error });
          return {
            content: [{ type: "text", text: `Failed to delete group: ${error.message}` }],
            isError: true
          };
        }
      }
    );
  }

  server.tool(
    "add_group_members",
    "Adds members to a group",
    {
      groupId: z.number().describe("The ID of the group"),
      members: z.array(z.object({
        email: z.string().describe("Email of the member to add"),
      })).describe("Array of members to add"),
    },
    async ({ groupId, members }) => {
      try {
        console.info(`Adding ${members.length} members to group ${groupId}`);
        const result = await api.groups.addGroupMembers(groupId, members);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      } catch (error: any) {
        console.error(`Failed to add members to group ${groupId}`, { error });
        return {
          content: [{ type: "text", text: `Failed to add group members: ${error.message}` }],
          isError: true
        };
      }
    }
  );

  if (allowDeleteTools) {
    server.tool(
      "remove_group_member",
      "Removes a member from a group",
      {
        groupId: z.number().describe("The ID of the group"),
        userId: z.number().describe("The ID of the user to remove"),
      },
      async ({ groupId, userId }) => {
        try {
          console.info(`Removing user ${userId} from group ${groupId}`);
          await api.groups.removeGroupMember(groupId, userId);
          return {
            content: [{ type: "text", text: `Successfully removed user ${userId} from group ${groupId}` }]
          };
        } catch (error: any) {
          console.error(`Failed to remove user ${userId} from group ${groupId}`, { error });
          return {
            content: [{ type: "text", text: `Failed to remove group member: ${error.message}` }],
            isError: true
          };
        }
      }
    );
  }

  server.tool(
    "get_group_members",
    "Gets all members of a group",
    {
      groupId: z.number().describe("The ID of the group"),
    },
    async ({ groupId }) => {
      try {
        console.info(`Getting members of group ${groupId}`);
        const members = await api.groups.getGroupMembers(groupId);
        return {
          content: [{ type: "text", text: JSON.stringify(members, null, 2) }]
        };
      } catch (error: any) {
        console.error(`Failed to get members of group ${groupId}`, { error });
        return {
          content: [{ type: "text", text: `Failed to get group members: ${error.message}` }],
          isError: true
        };
      }
    }
  );
}
