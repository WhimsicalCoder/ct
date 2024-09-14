"use client";
import React from "react";
import StylizedButton from "../components/stylized-button";

function MainComponent() {
  const [campaigns, setCampaigns] = React.useState([]);
  const [archivedCampaigns, setArchivedCampaigns] = React.useState([]);
  const [showArchive, setShowArchive] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterPlatform, setFilterPlatform] = React.useState("");
  const [showForm, setShowForm] = React.useState(false);
  const [editIndex, setEditIndex] = React.useState(null);

  const platforms = [
    "Tradedesk",
    "YouTube Skippable",
    "YouTube NonSkippable",
    "Paid Search",
    "Meta",
    "Linkedin",
    "Twitter",
    "Reddit",
    "Snapchat",
  ];

  const addCampaign = (campaign) => {
    setCampaigns([...campaigns, campaign]);
    setShowForm(false);
  };

  const editCampaign = (index, updatedCampaign) => {
    const newCampaigns = [...campaigns];
    newCampaigns[index] = updatedCampaign;
    setCampaigns(newCampaigns);
    setShowForm(false);
    setEditIndex(null);
  };

  const archiveCampaign = (index) => {
    const campaignToArchive = campaigns[index];
    setArchivedCampaigns([
      ...archivedCampaigns,
      { ...campaignToArchive, insightNotes: [] },
    ]);
    const newCampaigns = campaigns.filter((_, i) => i !== index);
    setCampaigns(newCampaigns);
  };

  const addInsightNote = (index, note) => {
    const newArchivedCampaigns = [...archivedCampaigns];
    newArchivedCampaigns[index].insightNotes = [
      ...(newArchivedCampaigns[index].insightNotes || []),
      note,
    ];
    setArchivedCampaigns(newArchivedCampaigns);
  };

  const deleteInsightNote = (campaignIndex, noteIndex) => {
    const newArchivedCampaigns = [...archivedCampaigns];
    newArchivedCampaigns[campaignIndex].insightNotes.splice(noteIndex, 1);
    setArchivedCampaigns(newArchivedCampaigns);
  };

  const filteredCampaigns = campaigns.filter(
    (campaign) =>
      campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterPlatform === "" || campaign.platforms.includes(filterPlatform))
  );

  const filteredArchivedCampaigns = archivedCampaigns.filter(
    (campaign) =>
      campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterPlatform === "" || campaign.platforms.includes(filterPlatform))
  );

  const exportData = (format) => {
    const dataToExport = showArchive ? archivedCampaigns : campaigns;
    if (format === "csv") {
      const csvContent =
        "data:text/csv;charset=utf-8," +
        "Name,Start Date,End Date,Platforms,Notes\n" +
        dataToExport
          .map(
            (c) =>
              `"${c.name}","${c.startDate}","${c.endDate}","${c.platforms.join(
                ", "
              )}","${c.notes}"`
          )
          .join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "campaigns.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (format === "pdf") {
    }
  };

  const getCampaignStatus = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    const daysUntilEnd = Math.ceil((end - today) / (1000 * 60 * 60 * 24));

    if (daysUntilEnd < 0) return "Completed";
    if (daysUntilEnd <= 7) return "Ending Soon";
    return "Live";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Live":
        return "bg-green-500";
      case "Ending Soon":
        return "bg-yellow-500";
      case "Completed":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="font-open-sans bg-white p-4 md:p-8">
      <h1 className="text-3xl font-semibold mb-6">Campaign Tracker</h1>

      <div className="mb-6 flex flex-wrap gap-4">
        <StylizedButton
          text={
            showArchive ? "View Active Campaigns" : "View Archived Campaigns"
          }
          onClick={() => setShowArchive(!showArchive)}
        />
        {!showArchive && (
          <StylizedButton
            text={showForm ? "Cancel" : "Add New Campaign"}
            onClick={() => {
              setShowForm(!showForm);
              setEditIndex(null);
            }}
          />
        )}
      </div>

      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Search campaigns..."
          className="border border-black p-2 rounded"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="border border-black p-2 rounded"
          value={filterPlatform}
          onChange={(e) => setFilterPlatform(e.target.value)}
        >
          <option value="">All Platforms</option>
          {platforms.map((platform, index) => (
            <option key={index} value={platform}>
              {platform}
            </option>
          ))}
        </select>
        <StylizedButton text="Export CSV" onClick={() => exportData("csv")} />
        <StylizedButton text="Export PDF" onClick={() => exportData("pdf")} />
      </div>

      {showForm && (
        <CampaignForm
          platforms={platforms}
          onSubmit={
            editIndex !== null
              ? (campaign) => editCampaign(editIndex, campaign)
              : addCampaign
          }
          initialData={editIndex !== null ? campaigns[editIndex] : null}
        />
      )}

      {!showArchive && (
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">Active Campaigns</h2>
          {filteredCampaigns.map((campaign, index) => {
            const status = getCampaignStatus(campaign.endDate);
            return (
              <div
                key={index}
                className={`bg-[#E0E7F1] p-4 mb-4 rounded border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${getStatusColor(
                  status
                )}`}
              >
                <h3 className="text-xl font-medium">{campaign.name}</h3>
                <p>Platforms: {campaign.platforms.join(", ")}</p>
                <p>Start Date: {campaign.startDate}</p>
                <p>End Date: {campaign.endDate}</p>
                <p>Notes: {campaign.notes}</p>
                <p>Status: {status}</p>
                <div className="mt-2 flex gap-2">
                  <StylizedButton
                    text="Edit"
                    onClick={() => {
                      setEditIndex(index);
                      setShowForm(true);
                    }}
                  />
                  <StylizedButton
                    text="Archive"
                    onClick={() => archiveCampaign(index)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showArchive && (
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">Archived Campaigns</h2>
          {filteredArchivedCampaigns.map((campaign, index) => (
            <div
              key={index}
              className="bg-[#E0E7F1] p-4 mb-4 rounded border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              <h3 className="text-xl font-medium">{campaign.name}</h3>
              <p>Platforms: {campaign.platforms.join(", ")}</p>
              <p>Start Date: {campaign.startDate}</p>
              <p>End Date: {campaign.endDate}</p>
              <p>Notes: {campaign.notes}</p>
              <div className="mt-4">
                <h4 className="font-medium">Insight Notes:</h4>
                {campaign.insightNotes &&
                  campaign.insightNotes.map((note, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <p>{note}</p>
                      <StylizedButton
                        text="Delete"
                        onClick={() => deleteInsightNote(index, i)}
                      />
                    </div>
                  ))}
                <input
                  type="text"
                  placeholder="Add insight note..."
                  className="border border-black p-2 rounded mt-2 w-full"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      addInsightNote(index, e.target.value);
                      e.target.value = "";
                    }
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .fade-in {
          animation: fadeIn 0.5s ease-in;
        }
      `}</style>
    </div>
  );
}

function CampaignForm({ platforms, onSubmit, initialData }) {
  const [formData, setFormData] = React.useState(
    initialData || {
      name: "",
      startDate: "",
      endDate: "",
      platforms: [],
      notes: "",
    }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePlatformChange = (platform) => {
    const newPlatforms = formData.platforms.includes(platform)
      ? formData.platforms.filter((p) => p !== platform)
      : [...formData.platforms, platform];
    setFormData({ ...formData, platforms: newPlatforms });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 p-4 bg-[#E0E7F1] rounded border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
    >
      <input
        type="text"
        name="name"
        placeholder="Campaign Name"
        value={formData.name}
        onChange={handleChange}
        className="w-full p-2 mb-2 border border-black rounded"
        required
      />
      <input
        type="date"
        name="startDate"
        value={formData.startDate}
        onChange={handleChange}
        className="w-full p-2 mb-2 border border-black rounded"
        required
      />
      <input
        type="date"
        name="endDate"
        value={formData.endDate}
        onChange={handleChange}
        className="w-full p-2 mb-2 border border-black rounded"
        required
      />
      <div className="mb-2">
        <p className="font-medium mb-1">Platforms:</p>
        <div className="flex flex-wrap gap-2">
          {platforms.map((platform, index) => (
            <label key={index} className="flex items-center">
              <input
                type="checkbox"
                checked={formData.platforms.includes(platform)}
                onChange={() => handlePlatformChange(platform)}
                className="mr-1"
              />
              {platform}
            </label>
          ))}
        </div>
      </div>
      <textarea
        name="notes"
        placeholder="Notes"
        value={formData.notes}
        onChange={handleChange}
        className="w-full p-2 mb-2 border border-black rounded"
      />
      <StylizedButton text="Submit" onClick={handleSubmit} />
    </form>
  );
}

export default MainComponent;
